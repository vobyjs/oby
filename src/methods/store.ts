
/* IMPORT */

import {BATCH, OBSERVER} from '~/context';
import {lazySetAdd, lazySetDelete, lazySetEach} from '~/lazy';
import cleanup from '~/methods/cleanup';
import effect from '~/methods/effect';
import isBatching from '~/methods/is_batching';
import isStore from '~/methods/is_store';
import untrack from '~/methods/untrack';
import {readable} from '~/objects/callable';
import ObservableClass from '~/objects/observable';
import {SYMBOL_STORE, SYMBOL_STORE_KEYS, SYMBOL_STORE_OBSERVABLE, SYMBOL_STORE_TARGET, SYMBOL_STORE_VALUES, SYMBOL_STORE_UNTRACKED} from '~/symbols';
import {castArray, is, isArray, isFunction, isObject, noop, nope} from '~/utils';
import type {IObservable, CallbackFunction, DisposeFunction, EqualsFunction, Observable, ObservableOptions, StoreOptions, ArrayMaybe, LazySet} from '~/types';

/* TYPES */

type StoreKey = string | number | symbol;

type StoreReconcileable = Array<any> | Record<StoreKey, any>;

type StoreTarget = Record<StoreKey, any>;

type StoreSelectorFunction = () => void;

type StoreListenableTarget = StoreTarget | StoreSelectorFunction;

type StoreListenerRegular = () => void;

type StoreListenerRoots<T = unknown> = ( roots: T[] ) => void;

type StoreNode = {
  parents: LazySet<StoreNode>,
  store: StoreTarget,
  listenersRegular?: LazySet<StoreListenerRegular>,
  listenersRoots?: LazySet<StoreListenerRoots>,
  getters?: StoreMap<StoreKey, Function>,
  setters?: StoreMap<StoreKey, Function>,
  keys?: StoreKeys,
  values?: StoreValues,
  has?: StoreMap<StoreKey, StoreHas>,
  properties?: StoreMap<StoreKey, StoreProperty>,
  equals?: EqualsFunction<unknown>
};

/* CLASSES */

class StoreMap<K, V> extends Map<K, V> {
  insert ( key: K, value: V ): V {
    super.set ( key, value );
    return value;
  }
}

class StoreCleanable {
  count: number = 0;
  listen (): void {
    this.count += 1;
    cleanup ( this );
  }
  call (): void {
    this.count -= 1;
    if ( this.count ) return;
    this.dispose ();
  }
  dispose (): void {}
}

class StoreKeys extends StoreCleanable {
  constructor ( public parent: StoreNode, public observable: IObservable<0> ) {
    super ();
  }
  dispose (): void {
    this.parent.keys = undefined;
  }
}

class StoreValues extends StoreCleanable {
  constructor ( public parent: StoreNode, public observable: IObservable<0> ) {
    super ();
  }
  dispose (): void {
    this.parent.values = undefined;
  }
}

class StoreHas extends StoreCleanable {
  constructor ( public parent: StoreNode, public key: StoreKey, public observable: IObservable<boolean> ) {
    super ();
  }
  dispose (): void {
    this.parent.has?.delete ( this.key );
  }
}

class StoreProperty extends StoreCleanable {
  constructor ( public parent: StoreNode, public key: StoreKey, public observable?: IObservable<unknown>, public node?: StoreNode ) {
    super ();
  }
  dispose (): void {
    this.parent.properties?.delete ( this.key );
  }
}

const StoreListenersRegular = {
  /* VARIABLES */
  active: 0,
  listeners: new Set<CallbackFunction>(),
  nodes: new Set<StoreNode>(),
  /* API */
  prepare: (): CallbackFunction => {
    const {listeners, nodes} = StoreListenersRegular;
    const traversed = new Set<StoreNode>();
    const traverse = ( node: StoreNode ): void => {
      if ( traversed.has ( node ) ) return;
      traversed.add ( node );
      lazySetEach ( node.parents, traverse );
      lazySetEach ( node.listenersRegular, listener => {
        listeners.add ( listener );
      });
    };
    nodes.forEach ( traverse );
    return (): void => {
      listeners.forEach ( listener => {
        listener ();
      });
    };
  },
  register: ( node: StoreNode ): void => {
    StoreListenersRegular.nodes.add ( node );
    StoreScheduler.schedule ();
  },
  reset: (): void => {
    StoreListenersRegular.listeners = new Set ();
    StoreListenersRegular.nodes = new Set ();
  }
};

const StoreListenersRoots = {
  /* VARIABLES */
  active: 0,
  nodes: new Map<StoreNode, Set<unknown>>(),
  /* API */
  prepare: (): CallbackFunction => {
    const {nodes} = StoreListenersRoots;
    return () => {
      nodes.forEach ( ( rootsSet, store ) => {
        const roots = Array.from ( rootsSet );
        lazySetEach ( store.listenersRoots, listener => {
          listener ( roots );
        });
      });
    };
  },
  register: ( store: StoreNode, root: unknown ): void => {
    const roots = StoreListenersRoots.nodes.get ( store ) || new Set ();
    roots.add ( root );
    StoreListenersRoots.nodes.set ( store, roots );
    StoreScheduler.schedule ();
  },
  registerWith: ( current: StoreNode | undefined, parent: StoreNode, key: StoreKey ): void => {
    if ( !parent.parents ) {
      const root = current?.store || untrack ( () => parent.store[key] );
      StoreListenersRoots.register ( parent, root );
    } else {
      const traversed = new Set<StoreNode>();
      const traverse = ( node: StoreNode ): void => {
        if ( traversed.has ( node ) ) return;
        traversed.add ( node );
        lazySetEach ( node.parents, parent => {
          if ( !parent.parents ) {
            StoreListenersRoots.register ( parent, node.store );
          }
          traverse ( parent );
        });
      };
      traverse ( current || parent );
    }
  },
  reset: (): void => {
    StoreListenersRoots.nodes = new Map ();
  }
};

const StoreScheduler = {
  /* VARIABLES */
  active: false,
  /* API */
  flush: (): void => {
    const flushRegular = StoreListenersRegular.prepare ();
    const flushRoots = StoreListenersRoots.prepare ();
    StoreScheduler.reset ();
    flushRegular ();
    flushRoots ();
  },
  flushIfNotBatching: (): void => {
    if ( isBatching () ) {
      if ( BATCH ) {
        BATCH.finally ( StoreScheduler.flushIfNotBatching );
      } else {
        setTimeout ( StoreScheduler.flushIfNotBatching, 0 );
      }
    } else {
      StoreScheduler.flush ();
    }
  },
  reset: (): void => {
    StoreScheduler.active = false;
    StoreListenersRegular.reset ();
    StoreListenersRoots.reset ();
  },
  schedule: (): void => {
    if ( StoreScheduler.active ) return;
    StoreScheduler.active = true;
    queueMicrotask ( StoreScheduler.flushIfNotBatching );
  }
}

/* CONSTANTS */

const NODES = new WeakMap<StoreTarget, StoreNode> ();

const SPECIAL_SYMBOLS = new Set<StoreKey> ([ SYMBOL_STORE, SYMBOL_STORE_KEYS, SYMBOL_STORE_OBSERVABLE, SYMBOL_STORE_TARGET, SYMBOL_STORE_VALUES ]);

const UNREACTIVE_KEYS = new Set<StoreKey> ([ '__proto__', '__defineGetter__', '__defineSetter__', '__lookupGetter__', '__lookupSetter__', 'prototype', 'constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toSource', 'toString', 'valueOf' ]);

const STORE_TRAPS = {

  /* API */

  get: ( target: StoreTarget, key: StoreKey ): unknown => {

    if ( SPECIAL_SYMBOLS.has ( key ) ) {

      if ( key === SYMBOL_STORE ) return true;

      if ( key === SYMBOL_STORE_TARGET ) return target;

      if ( key === SYMBOL_STORE_KEYS ) {

        if ( isListenable () ) {

          const node = getNodeExisting ( target );

          node.keys ||= getNodeKeys ( node );
          node.keys.listen ();
          node.keys.observable.get ();

        }

        return;

      }

      if ( key === SYMBOL_STORE_VALUES ) {

        if ( isListenable () ) {

          const node = getNodeExisting ( target );

          node.values ||= getNodeValues ( node );
          node.values.listen ();
          node.values.observable.get ();

        }

        return;

      }

      if ( key === SYMBOL_STORE_OBSERVABLE ) {

        return ( key: StoreKey ): Observable<unknown> => {

          key = ( typeof key === 'number' ) ? String ( key ) : key;

          const node = getNodeExisting ( target );
          const getter = node.getters?.get ( key );

          if ( getter ) return getter.bind ( node.store );

          node.properties ||= new StoreMap ();

          const value = target[key];
          const property = node.properties.get ( key ) || node.properties.insert ( key, getNodeProperty ( node, key, value ) );
          const options = node.equals ? { equals: node.equals } : undefined;

          property.observable ||= getNodeObservable ( node, value, options );

          const observable = readable ( property.observable );

          return observable;

        };

      }

    }

    if ( UNREACTIVE_KEYS.has ( key ) ) return target[key];

    const node = getNodeExisting ( target );
    const getter = node.getters?.get ( key );
    const value = getter || target[key];

    node.properties ||= new StoreMap ();

    const listenable = isListenable ();
    const proxiable = isProxiable ( value );
    const property = listenable || proxiable ? node.properties.get ( key ) || node.properties.insert ( key, getNodeProperty ( node, key, value ) ) : undefined;

    if ( property?.node ) {

      lazySetAdd ( property.node, 'parents', node );

    }

    if ( property && listenable ) {

      const options = node.equals ? { equals: node.equals } : undefined;

      property.listen ();
      property.observable ||= getNodeObservable ( node, value, options );
      property.observable.get ();

    }

    if ( getter ) {

      return getter.call ( node.store );

    } else {

      if ( typeof value === 'function' && value === Array.prototype[key] ) {
        return function () {
          return value.apply ( node.store, arguments );
        };
      }

      return property?.node?.store || value;

    }

  },

  set: ( target: StoreTarget, key: StoreKey, value: unknown ): boolean => {

    value = getTarget ( value );

    const node = getNodeExisting ( target );
    const setter = node.setters?.get ( key );

    if ( setter ) {

      setter.call ( node.store, value );

    } else {

      const targetIsArray = isArray ( target );
      const valuePrev = target[key];
      const hadProperty = !!valuePrev || ( key in target );
      const equals = node.equals || is;

      if ( hadProperty && equals ( value, valuePrev ) && ( key !== 'length' || !targetIsArray ) ) return true; // Array.prototype.length is special, it gets updated before this trap is called, we need to special-case it...

      const lengthPrev = targetIsArray && target['length'];

      target[key] = value;

      const lengthNext = targetIsArray && target['length'];

      if ( targetIsArray && key !== 'length' && lengthPrev !== lengthNext ) { // Inferring updating the length property, since it happens implicitly
        node.properties?.get ( 'length' )?.observable?.set ( lengthNext );
      }

      node.values?.observable.set ( 0 );

      if ( !hadProperty ) {
        node.keys?.observable.set ( 0 );
        node.has?.get ( key )?.observable.set ( true );
      }

      const property = node.properties?.get ( key );

      if ( property?.node ) {
        lazySetDelete ( property.node, 'parents', node );
      }

      if ( property ) {
        property.observable?.set ( value );
        property.node = isProxiable ( value ) ? NODES.get ( value ) || getNode ( value, key, node ) : undefined;
      }

      if ( property?.node ) {
        lazySetAdd ( property.node, 'parents', node );
      }

      if ( StoreListenersRoots.active ) {
        StoreListenersRoots.registerWith ( property?.node, node, key );
      }

      if ( StoreListenersRegular.active ) {
        StoreListenersRegular.register ( node );
      }

      if ( targetIsArray && key === 'length' ) { // Inferring deleting keys, since it happens implicitly
        const lengthPrev = Number ( valuePrev );
        const lengthNext = Number ( value );

        for ( let i = lengthNext; i < lengthPrev; i++ ) {
          if ( i in target ) continue;
          STORE_TRAPS.deleteProperty ( target, `${i}`, true );
        }
      }

    }

    return true;

  },

  deleteProperty: ( target: StoreTarget, key: StoreKey, _force?: boolean ): boolean => {

    const hasProperty = ( key in target );

    if ( !_force && !hasProperty ) return true;

    const deleted = Reflect.deleteProperty ( target, key );

    if ( !deleted ) return false;

    const node = getNodeExisting ( target );

    node.getters?.delete ( key );
    node.setters?.delete ( key );
    node.keys?.observable.set ( 0 );
    node.values?.observable.set ( 0 );
    node.has?.get ( key )?.observable.set ( false );

    const property = node.properties?.get ( key );

    if ( StoreListenersRoots.active ) {
      StoreListenersRoots.registerWith ( property?.node, node, key );
    }

    if ( property?.node ) {
      lazySetDelete ( property.node, 'parents', node );
    }

    if ( property ) {
      property.observable?.set ( undefined );
      property.node = undefined;
    }

    if ( StoreListenersRegular.active ) {
      StoreListenersRegular.register ( node );
    }

    return true;

  },

  defineProperty: ( target: StoreTarget, key: StoreKey, descriptor: PropertyDescriptor ): boolean => {

    const node = getNodeExisting ( target );
    const equals = node.equals || is;

    const hadProperty = ( key in target );
    const descriptorPrev = Reflect.getOwnPropertyDescriptor ( target, key );

    if ( 'value' in descriptor && isStore ( descriptor.value ) ) {
      descriptor = { ...descriptor, value: getTarget ( descriptor.value ) };
    }

    if ( descriptorPrev && isEqualDescriptor ( descriptorPrev, descriptor, equals ) ) return true;

    const defined = Reflect.defineProperty ( target, key, descriptor );

    if ( !defined ) return false;

    if ( !descriptor.get ) {
      node.getters?.delete ( key );
    } else if ( descriptor.get ) {
      node.getters ||= new StoreMap ();
      node.getters.set ( key, descriptor.get );
    }

    if ( !descriptor.set ) {
      node.setters?.delete ( key );
    } else if ( descriptor.set ) {
      node.setters ||= new StoreMap ();
      node.setters.set ( key, descriptor.set );
    }

    if ( hadProperty !== !!descriptor.enumerable ) {
      node.keys?.observable.set ( 0 );
    }

    node.has?.get ( key )?.observable.set ( true );

    const property = node.properties?.get ( key );

    if ( StoreListenersRoots.active ) {
      StoreListenersRoots.registerWith ( property?.node, node, key );
    }

    if ( property?.node ) {
      lazySetDelete ( property.node, 'parents', node );
    }

    if ( property ) {
      if ( 'get' in descriptor ) {
        property.observable?.set ( descriptor.get );
        property.node = undefined;
      } else {
        const value = descriptor.value;
        property.observable?.set ( value );
        property.node = isProxiable ( value ) ? NODES.get ( value ) || getNode ( value, key, node ) : undefined;
      }
    }

    if ( property?.node ) {
      lazySetAdd ( property.node, 'parents', node );
    }

    if ( StoreListenersRoots.active ) {
      StoreListenersRoots.registerWith ( property?.node, node, key );
    }

    if ( StoreListenersRegular.active ) {
      StoreListenersRegular.register ( node );
    }

    return true;

  },

  has: ( target: StoreTarget, key: StoreKey ): boolean => {

    if ( key === SYMBOL_STORE ) return true;

    if ( key === SYMBOL_STORE_TARGET ) return true;

    const value = ( key in target );

    if ( isListenable () ) {

      const node = getNodeExisting ( target );

      node.has ||= new StoreMap ();

      const has = node.has.get ( key ) || node.has.insert ( key, getNodeHas ( node, key, value ) );

      has.listen ();
      has.observable.get ();

    }

    return value;

  },

  ownKeys: ( target: StoreTarget ): (string | symbol)[] => {

    const keys = Reflect.ownKeys ( target );

    if ( isListenable () ) {

      const node = getNodeExisting ( target );

      node.keys ||= getNodeKeys ( node );
      node.keys.listen ();
      node.keys.observable.get ();

    }

    return keys;

  }

};

const STORE_UNTRACK_TRAPS = {

  /* API */

  has: ( target: StoreTarget, key: StoreKey ): boolean => {

    if ( key === SYMBOL_STORE_UNTRACKED ) return true;

    return ( key in target );

  }

};

/* HELPERS */

const getNode = <T extends StoreTarget> ( value: T, key?: StoreKey, parent?: StoreNode, equals?: EqualsFunction<unknown> | false ): StoreNode => {

  if ( isStore ( value ) ) return getNodeExisting ( getTarget ( value ) );

  const store = isFrozenLike ( value, key, parent ) ? value : new Proxy ( value, STORE_TRAPS );
  const gettersAndSetters = getGettersAndSetters ( value );
  const node: StoreNode = { parents: parent, store };

  if ( gettersAndSetters ) {
    const {getters, setters} = gettersAndSetters;
    if ( getters ) node.getters = getters;
    if ( setters ) node.setters = setters;
  }

  if ( equals === false ) {
    node.equals = nope;
  } else if ( equals ) {
    node.equals = equals;
  } else if ( parent?.equals ) {
    node.equals = parent.equals;
  }

  NODES.set ( value, node );

  return node;

};

const getNodeExisting = <T extends StoreTarget> ( value: T ): StoreNode => {

  const node = NODES.get ( value );

  if ( !node ) throw new Error ( 'Impossible' );

  return node;

};

const getNodeFromStore = <T extends StoreTarget> ( store: T ): StoreNode => {

  return getNodeExisting ( getTarget ( store ) );

};

const getNodeKeys = ( node: StoreNode ): StoreKeys => {

  const observable = getNodeObservable<0> ( node, 0, { equals: false } );
  const keys = new StoreKeys ( node, observable );

  return keys;

};

const getNodeValues = ( node: StoreNode ): StoreValues => {

  const observable = getNodeObservable<0> ( node, 0, { equals: false } );
  const values = new StoreValues ( node, observable );

  return values;

};

const getNodeHas = ( node: StoreNode, key: StoreKey, value: boolean ): StoreHas => {

  const observable = getNodeObservable ( node, value );
  const has = new StoreHas ( node, key, observable );

  return has;

};

const getNodeObservable = <T> ( node: StoreNode, value: T, options?: ObservableOptions ): IObservable<T> => {

  return new ObservableClass ( value, options );

};

const getNodeProperty = ( node: StoreNode, key: StoreKey, value: unknown ): StoreProperty => {

  const observable = undefined;
  const propertyNode = isProxiable ( value ) ? NODES.get ( value ) || getNode ( value, key, node ) : undefined;
  const property = new StoreProperty ( node, key, observable, propertyNode );

  node.properties ||= new StoreMap ();
  node.properties.set ( key, property );

  return property;

};

const getGettersAndSetters = ( value: StoreTarget ): { getters?: StoreMap<string | symbol, Function>, setters?: StoreMap<string | symbol, Function> } | undefined => {

  if ( isArray ( value ) ) return;

  let getters: StoreMap<string | symbol, Function> | undefined;
  let setters: StoreMap<string | symbol, Function> | undefined;

  const keys = Object.keys ( value );

  for ( let i = 0, l = keys.length; i < l; i++ ) {

    const key = keys[i];
    const descriptor = Object.getOwnPropertyDescriptor ( value, key );

    if ( !descriptor ) continue;

    const {get, set} = descriptor;

    if ( get ) {
      getters ||= new StoreMap ();
      getters.set ( key, get );
    }

    if ( set ) {
      setters ||= new StoreMap ();
      setters.set ( key, set );
    }

    if ( get && !set ) { // This ensures that settings throws without first reading the getter, very cheaply
      setters ||= new StoreMap ();
      setters.set ( key, throwNoSetterError );
    }

  }

  if ( !getters && !setters ) return;

  return { getters, setters };

};

const getStore = <T extends StoreTarget> ( value: T, options?: StoreOptions ): T => {

  if ( isStore ( value ) ) return value;

  const node = NODES.get ( value ) || getNode ( value, undefined, undefined, options?.equals );

  return node.store;

};

const getTarget = <T> ( value: T ): T => {

  if ( isStore ( value ) ) return value[SYMBOL_STORE_TARGET];

  return value;

};

const getUntracked = <T> ( value: T ): T => {

  if ( !isObject ( value ) ) return value;

  if ( isUntracked ( value ) ) return value;

  return new Proxy ( value, STORE_UNTRACK_TRAPS );

};

const isEqualDescriptor = ( a: PropertyDescriptor, b: PropertyDescriptor, equals: EqualsFunction<unknown> ): boolean => {

  return ( !!a.configurable === !!b.configurable && !!a.enumerable === !!b.enumerable && !!a.writable === !!b.writable && equals ( a.value, b.value ) && a.get === b.get && a.set === b.set );

};

const isFrozenLike = <T extends StoreTarget> ( value: T, key?: StoreKey, parent?: StoreNode ): boolean => { // Some objects can't be proxied, to preserve a proxy trap invariant

  if ( Object.isFrozen ( value ) ) return true;

  if ( !parent || key === undefined ) return false;

  const target = store.unwrap ( parent.store );
  const descriptor = Reflect.getOwnPropertyDescriptor ( target, key );

  if ( descriptor?.configurable || descriptor?.writable ) return false;

  return true;

};

const isListenable = (): boolean => { // Checks whether the current owner can listen for observables

  return !!OBSERVER;

};

const isProxiable = ( value: unknown ): value is StoreTarget => { // Checks whether the value can be proxied

  if ( value === null || typeof value !== 'object' ) return false;

  if ( SYMBOL_STORE in value ) return true;

  if ( SYMBOL_STORE_UNTRACKED in value ) return false;

  if ( isArray ( value ) ) return true;

  const prototype = Object.getPrototypeOf ( value );

  if ( prototype === null ) return true;

  return ( Object.getPrototypeOf ( prototype ) === null );

};

const isUntracked = ( value: unknown ): boolean => {

  if ( value === null || typeof value !== 'object' ) return false;

  return ( SYMBOL_STORE_UNTRACKED in value );

};

const throwNoSetterError = (): never => {

  throw new TypeError ( 'Cannot set property value of #<Object> which has only a getter' );

};

/* MAIN */

//TODO: Maybe have the "on" method trigger immediately too like "$.on", or maybe the other way around, which seems more flexible
//TODO: Explore converting target values back to numbers (the Proxy always receives strings) whenever possible, to save memory
//TODO: Implement "_onRoots" better, perhaps provding string paths instead, which should be more powerful

const store = <T> ( value: T, options?: StoreOptions ): T => {

  if ( !isObject ( value ) ) return value;

  if ( isUntracked ( value ) ) return value;

  return getStore ( value, options );

};

/* UTILITIES */

store.on = ( target: ArrayMaybe<StoreListenableTarget>, listener: CallbackFunction ): DisposeFunction => {

  /* VARIABLES */

  const targets = isStore ( target ) ? [target] : castArray ( target );
  const selectors = targets.filter ( isFunction );
  const nodes = targets.filter ( isStore ).map ( getNodeFromStore );

  /* ON */

  StoreListenersRegular.active += 1;

  const disposers = selectors.map ( selector => {
    let inited = false;
    return effect ( () => {
      if ( inited ) {
        StoreListenersRegular.listeners.add ( listener );
        StoreScheduler.schedule ();
      }
      inited = true;
      selector ();
    }, { suspense: false, sync: true } );
  });

  nodes.forEach ( node => {
    lazySetAdd ( node, 'listenersRegular', listener );
  });

  /* OFF */

  return (): void => {

    StoreListenersRegular.active -= 1;

    disposers.forEach ( disposer => {
      disposer ();
    });

    nodes.forEach ( node => {
      lazySetDelete ( node, 'listenersRegular', listener );
    });

  };

};

store._onRoots = <K extends StoreKey, V extends unknown> ( target: Record<K, V>, listener: StoreListenerRoots<V> ): DisposeFunction => {

  if ( !isStore ( target ) ) return noop;

  const node = getNodeFromStore ( target );

  if ( node.parents ) throw new Error ( 'Only top-level stores are supported' );

  /* ON */

  StoreListenersRoots.active += 1;

  lazySetAdd ( node, 'listenersRoots', listener );

  /* OFF */

  return (): void => {

    StoreListenersRoots.active -= 1;

    lazySetDelete ( node, 'listenersRoots', listener );

  };

};

store.reconcile = (() => {

  //TODO: Support getters, setters and symbols (symbols could be supported with Reflect.ownKeys, but that's like 2x slower)

  const getType = ( value: unknown ): 0 | 1 | 2 => {

    if ( isArray ( value ) ) return 1;

    if ( isProxiable ( value ) ) return 2;

    return 0;

  };

  const reconcileOuter = <T extends StoreReconcileable> ( prev: T, next: T ): T => {

    const uprev = getTarget ( prev );
    const unext = getTarget ( next );

    reconcileInner ( prev, next );

    const prevType = getType ( uprev );
    const nextType = getType ( unext );

    if ( prevType === 1 || nextType === 1 ) {

      prev.length = next.length;

    }

    return prev;

  };

  const reconcileInner = <T extends StoreReconcileable> ( prev: T, next: T ): T => {

    const uprev = getTarget ( prev );
    const unext = getTarget ( next );

    const prevKeys = Object.keys ( uprev );
    const nextKeys = Object.keys ( unext );

    for ( let i = 0, l = nextKeys.length; i < l; i++ ) {

      const key = nextKeys[i];
      const prevValue = uprev[key]
      const nextValue = unext[key];

      if ( !is ( prevValue, nextValue ) ) {

        const prevType = getType ( prevValue );
        const nextType = getType ( nextValue );

        if ( prevType && prevType === nextType ) {

          reconcileInner ( prev[key], nextValue );

          if ( prevType === 1 ) {

            prev[key].length = nextValue.length;

          }

        } else {

          prev[key] = nextValue;

        }

      } else if ( prevValue === undefined && !( key in uprev ) ) {

        prev[key] = undefined;

      }

    }

    for ( let i = 0, l = prevKeys.length; i < l; i++ ) {

      const key = prevKeys[i];

      if ( !( key in unext ) ) {

        delete prev[key];

      }

    }

    return prev;

  };

  const reconcile = <T extends StoreReconcileable> ( prev: T, next: T ): T => {

    return untrack ( () => {

      return reconcileOuter ( prev, next );

    });

  };

  return reconcile;

})();

store.untrack = <T> ( value: T ): T => {

  return getUntracked ( value );

};

store.unwrap = <T> ( value: T ): T => {

  return getTarget ( value );

};

/* EXPORT */

export default store;
