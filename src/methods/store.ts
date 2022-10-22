
/* IMPORT */

import {IS, ROOT, SYMBOL_STORE, SYMBOL_STORE_OBSERVABLE, SYMBOL_STORE_TARGET, SYMBOL_STORE_VALUES, TRACKING} from '~/constants';
import {lazySetAdd, lazySetDelete, lazySetEach} from '~/lazy';
import batch from '~/methods/batch';
import cleanup from '~/methods/cleanup';
import isStore from '~/methods/is_store';
import reaction from '~/methods/reaction';
import untrack from '~/methods/untrack';
import {readable} from '~/objects/callable';
import ObservableClass from '~/objects/observable';
import {castArray, isArray, isFunction} from '~/utils';
import type {IObservable, CallbackFunction, DisposeFunction, Observable, ObservableOptions, StoreOptions, ArrayMaybe, LazySet, Signal} from '~/types';

/* TYPES */

type StoreKey = string | number | symbol;

type StoreReconcileable = Array<any> | Record<StoreKey, any>;

type StoreTarget = Record<StoreKey, any>;

type StoreSelectorFunction = () => void;

type StoreListenableTarget = StoreTarget | StoreSelectorFunction;

type StoreNode = {
  parents: LazySet<StoreNode>,
  store: StoreTarget,
  signal: Signal,
  listeners?: LazySet<CallbackFunction>,
  getters?: StoreMap<StoreKey, Function>,
  setters?: StoreMap<StoreKey, Function>,
  keys?: StoreKeys,
  values?: StoreValues,
  has?: StoreMap<StoreKey, StoreHas>,
  properties?: StoreMap<StoreKey, StoreProperty>
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

class StoreScheduler {
  /* VARIABLES */
  static active = 0;
  static listeners = new Set<CallbackFunction>();
  static nodes = new Set<StoreNode>();
  static waiting = false;
  /* API */
  static flush = (): void => {
    const {listeners, nodes} = StoreScheduler;
    StoreScheduler.reset ();
    const traverse = ( node: StoreNode ): void => {
      lazySetEach ( node.parents, traverse );
      lazySetEach ( node.listeners, listener => {
        listeners.add ( listener );
      });
    };
    nodes.forEach ( traverse );
    listeners.forEach ( listener => listener () );
  };
  static register = ( node: StoreNode ): void => {
    if ( !StoreScheduler.active ) return;
    StoreScheduler.nodes.add ( node );
    if ( StoreScheduler.waiting ) return;
    StoreScheduler.waiting = true;
    queueMicrotask ( StoreScheduler.flush );
  };
  static reset = (): void => {
    StoreScheduler.waiting = false;
    StoreScheduler.nodes = new Set ();
    StoreScheduler.listeners = new Set ();
  };
}

/* CONSTANTS */

const NODES = new WeakMap<StoreTarget, StoreNode> ();

const SPECIAL_SYMBOLS = new Set<StoreKey> ([ SYMBOL_STORE, SYMBOL_STORE_OBSERVABLE, SYMBOL_STORE_TARGET, SYMBOL_STORE_VALUES ]);

const UNREACTIVE_KEYS = new Set<StoreKey> ([ '__proto__', '__defineGetter__', '__defineSetter__', '__lookupGetter__', '__lookupSetter__', 'prototype', 'constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toSource', 'toString', 'valueOf' ]);

const TRAPS = {

  /* API */

  get: ( target: StoreTarget, key: StoreKey ): unknown => {

    if ( SPECIAL_SYMBOLS.has ( key ) ) {

      if ( key === SYMBOL_STORE ) return true;

      if ( key === SYMBOL_STORE_TARGET ) return target;

      if ( key === SYMBOL_STORE_VALUES ) {

        if ( isListenable () ) {

          const node = getNodeExisting ( target );

          node.values ||= getNodeValues ( node );
          node.values.listen ();
          node.values.observable.read ();

        }

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

          property.observable ||= getNodeObservable ( node, value );

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

    if ( listenable && property ) {

      property.listen ();
      property.observable ||= getNodeObservable ( node, value );
      property.observable.read ();

    }

    if ( getter ) {

      return getter.call ( node.store );

    } else {

      if ( typeof value === 'function' && value === Array.prototype[key] ) {
        return function () {
          return batch ( () => value.apply ( node.store, arguments ) );
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

      batch ( () => setter.call ( node.store, value ) );

    } else {

      const valuePrev = target[key];
      const hadProperty = !!valuePrev || ( key in target );

      target[key] = value;

      batch ( () => {

        if ( !hadProperty || !IS ( value, valuePrev ) ) {
          StoreScheduler.register ( node );
        }

        node.values?.observable.write ( 0 );

        if ( !hadProperty ) {
          node.keys?.observable.write ( 0 );
          node.has?.get ( key )?.observable.write ( true );
        }

        const property = node.properties?.get ( key );

        if ( property?.node ) {
          lazySetDelete ( property.node, 'parents', node );
        }

        if ( property ) {
          property.observable?.write ( value );
          property.node = isProxiable ( value ) ? NODES.get ( value ) || getNode ( value, node ) : undefined;
        }

        if ( property?.node ) {
          lazySetAdd ( property.node, 'parents', node );
        }

      });

    }

    return true;

  },

  deleteProperty: ( target: StoreTarget, key: StoreKey ): boolean => {

    const hasProperty = ( key in target );

    if ( !hasProperty ) return true;

    const deleted = Reflect.deleteProperty ( target, key );

    if ( !deleted ) return false;

    const node = getNodeExisting ( target );

    batch ( () => {

      StoreScheduler.register ( node );

      node.keys?.observable.write ( 0 );
      node.values?.observable.write ( 0 );
      node.has?.get ( key )?.observable.write ( false );

      const property = node.properties?.get ( key );

      if ( property?.node ) {
        lazySetDelete ( property.node, 'parents', node );
      }

      if ( property ) {
        property.observable?.write ( undefined );
        property.node = undefined;
      }

    });

    return true;

  },

  defineProperty: ( target: StoreTarget, key: StoreKey, descriptor: PropertyDescriptor ): boolean => {

    const hadProperty = ( key in target );
    const descriptorPrev = Reflect.getOwnPropertyDescriptor ( target, key );

    if ( descriptorPrev && isEqualDescriptor ( descriptorPrev, descriptor ) ) return true;

    const defined = Reflect.defineProperty ( target, key, descriptor );

    if ( !defined ) return false;

    const node = getNodeExisting ( target );

    batch ( () => {

      StoreScheduler.register ( node );

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
        node.keys?.observable.write ( 0 );
        node.has?.get ( key )?.observable.write ( !!descriptor.enumerable );
      }

      const property = node.properties?.get ( key );

      if ( property?.node ) {
        lazySetDelete ( property.node, 'parents', node );
      }

      if ( property ) {
        if ( 'get' in descriptor ) {
          property.observable?.write ( descriptor.get );
          property.node = undefined;
        } else {
          const value = descriptor['val' + 'ue']; //UGLY: Bailing out of mangling
          property.observable?.write ( value );
          property.node = isProxiable ( value ) ? NODES.get ( value ) || getNode ( value, node ) : undefined;
        }
      }

      if ( property?.node ) {
        lazySetAdd ( property.node, 'parents', node );
      }

    });

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
      has.observable.read ();

    }

    return value;

  },

  ownKeys: ( target: StoreTarget ): (string | symbol)[] => {

    const keys = Reflect.ownKeys ( target );

    if ( isListenable () ) {

      const node = getNodeExisting ( target );

      node.keys ||= getNodeKeys ( node );
      node.keys.listen ();
      node.keys.observable.read ();

    }

    return keys;

  }

};

/* HELPERS */

const getNode = <T = StoreTarget> ( value: T, parent?: StoreNode ): StoreNode => {

  const store = new Proxy ( value, TRAPS );
  const signal = parent?.signal || ROOT.current;
  const {getters, setters} = getGettersAndSetters ( value );
  const node: StoreNode = { parents: parent, store, signal };

  if ( getters ) node.getters = getters;
  if ( setters ) node.setters = setters;

  NODES.set ( value, node );

  return node;

};

const getNodeExisting = <T = StoreTarget> ( value: T ): StoreNode => {

  const node = NODES.get ( value );

  if ( !node ) throw new Error ( 'Impossible' );

  return node;

};

const getNodeFromStore = <T = StoreTarget> ( store: T ): StoreNode => {

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

  const observable = new ObservableClass ( value, options );

  observable.signal = node.signal;

  return observable;

};

const getNodeProperty = ( node: StoreNode, key: StoreKey, value: unknown ): StoreProperty => {

  const observable = undefined;
  const propertyNode = isProxiable ( value ) ? NODES.get ( value ) || getNode ( value, node ) : undefined;
  const property = new StoreProperty ( node, key, observable, propertyNode );

  node.properties ||= new StoreMap ();
  node.properties.set ( key, property );

  return property;

};

const getGettersAndSetters = ( value: StoreTarget ): { getters?: StoreMap<string | symbol, Function>, setters?: StoreMap<string | symbol, Function> } => {

  if ( isArray ( value ) ) return {};

  let getters: StoreMap<string | symbol, Function> | undefined;
  let setters: StoreMap<string | symbol, Function> | undefined;

  const keys = Reflect.ownKeys ( value );

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

  }

  return { getters, setters };

};

const getStore = <T = StoreTarget> ( value: T ): T => {

  if ( isStore ( value ) ) return value;

  const node = NODES.get ( value ) || getNode ( value );

  return node.store;

};

const getTarget = <T> ( value: T ): T => {

  if ( isStore ( value ) ) return value[SYMBOL_STORE_TARGET];

  return value;

};

const isEqualDescriptor = ( a: PropertyDescriptor, b: PropertyDescriptor ): boolean => {

  return ( !!a.configurable === !!b.configurable && !!a.enumerable === !!b.enumerable && !!a.writable === !!b.writable && IS ( a.value, b.value ) && a.get === b.get && a.set === b.set );

};

const isListenable = (): boolean => { // Checks whether the current owner can listen for observables

  return TRACKING.current;

};

const isProxiable = ( value: unknown ): value is StoreTarget => { // Checks whether the value can be proxied

  if ( value === null || typeof value !== 'object' ) return false;

  if ( isArray ( value ) ) return true;

  const prototype = Object.getPrototypeOf ( value );

  if ( prototype === null ) return true;

  return ( Object.getPrototypeOf ( prototype ) === null );

};

/* MAIN */

//TODO: Add an option for immutable stores that are edited via set/merge/produce functions, which have none of the issues but poor DX
//TODO: Maybe have the "on" method trigger immediately too like "$.on", or maybe the other way around, which seems more flexible
//TODO: Explore converting target values back to numbers (the Proxy always receives strings) whenever possible, to save memory

const store = <T> ( value: T, options?: StoreOptions ): T => {

  if ( !isProxiable ( value ) ) return value;

  return getStore ( value );

};

/* UTILITIES */

store.on = ( target: ArrayMaybe<StoreListenableTarget>, listener: CallbackFunction ): DisposeFunction => {

  /* VARIABLES */

  const targets = castArray ( target );
  const selectors = targets.filter ( isFunction );
  const nodes = targets.filter ( isStore ).map ( getNodeFromStore );

  /* ON */

  StoreScheduler.active += 1;

  const disposers = selectors.map ( selector => {
    let inited = false;
    return reaction ( () => {
      if ( inited ) {
        StoreScheduler.listeners.add ( listener );
      }
      inited = true;
      selector ();
    });
  });

  nodes.forEach ( node => {
    lazySetAdd ( node, 'listeners', listener );
  });

  /* OFF */

  return (): void => {

    StoreScheduler.active -= 1;

    disposers.forEach ( disposer => {
      disposer ();
    });

    nodes.forEach ( node => {
      lazySetDelete ( node, 'listeners', listener );
    });

  };

};

store.reconcile = (() => {

  //TODO: Support getters, setters and symbols (symbols could be supported with Reflect.ownKeys, but that's like 2x slower)

  const getType = ( value: unknown ): 0 | 1 | 2 => {

    if ( isArray ( value ) ) return 1;

    if ( isProxiable ( value ) ) return 2;

    return 0;

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

      if ( !IS ( prevValue, nextValue ) ) {

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

    return batch ( () => {

      return untrack ( () => {

        return reconcileInner ( prev, next );

      });

    });

  };

  return reconcile;

})();

store.unwrap = <T> ( value: T ): T => {

  return getTarget ( value );

};

/* EXPORT */

export default store;
