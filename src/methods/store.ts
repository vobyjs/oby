
/* IMPORT */

import {OWNER, ROOT, SYMBOL_STORE, SYMBOL_STORE_TARGET, SYMBOL_STORE_VALUES} from '~/constants';
import batch from '~/methods/batch';
import cleanup from '~/methods/cleanup';
import isStore from '~/methods/is_store';
import Computation from '~/objects/computation';
import Observable from '~/objects/observable';
import type {IObservable, ObservableOptions, StoreOptions, Signal} from '~/types';

/* TYPES */

type StoreKey = string | number | symbol;

type StoreTarget = Record<StoreKey, any>;

type StoreNode = {
  store: StoreTarget,
  signal: Signal,
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

/* CONSTANTS */

const NODES = new WeakMap<StoreTarget, StoreNode> ();

const UNREACTIVE_KEYS = new Set<StoreKey> ([ '__proto__', 'prototype', 'constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toSource', 'toString', 'valueOf' ]);

const TRAPS = {

  /* API */

  get: ( target: StoreTarget, key: StoreKey ): unknown => {

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

    if ( UNREACTIVE_KEYS.has ( key ) ) return target[key];

    const node = getNodeExisting ( target );
    const getter = node.getters?.get ( key );
    const value = getter || target[key];

    node.properties ||= new StoreMap ();

    const property = node.properties.get ( key ) || node.properties.insert ( key, getNodeProperty ( node, key, value ) );

    if ( isListenable () ) {

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

      return property.node?.store || value;

    }

  },

  set: ( target: StoreTarget, key: StoreKey, value: unknown ): boolean => {

    value = getTarget ( value );

    const node = getNodeExisting ( target );
    const setter = node.setters?.get ( key );

    if ( setter ) {

      batch ( () => setter.call ( node.store, value ) );

    } else {

      const hadProperty = ( key in target );

      target[key] = value;

      batch ( () => {

        node.values?.observable.write ( 0 );

        if ( !hadProperty ) {
          node.keys?.observable.write ( 0 );
          node.has?.get ( key )?.observable.write ( true );
        }

        const property = node.properties?.get ( key );
        if ( property ) {
          property.observable?.write ( value );
          property.node = isProxiable ( value ) ? NODES.get ( value ) || getNode ( value, node ) : undefined;
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

      node.keys?.observable.write ( 0 );
      node.values?.observable.write ( 0 );
      node.has?.get ( key )?.observable.write ( false );

      const property = node.properties?.get ( key );
      if ( property ) {
        property.observable?.write ( undefined );
        property.node = undefined;
      }

    });

    return true;

  },

  defineProperty: ( target: StoreTarget, key: StoreKey, descriptor: PropertyDescriptor ): boolean => {

    const hadProperty = ( key in target );
    const defined = Reflect.defineProperty ( target, key, descriptor );

    if ( !defined ) return false;

    const node = getNodeExisting ( target );

    batch ( () => {

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
  const signal = parent?.signal || OWNER.current.signal || ROOT.current;
  const {getters, setters} = getGettersAndSetters ( value );
  const node: StoreNode = { store, signal };

  if ( getters ) node.getters = getters;
  if ( setters ) node.setters = setters;

  NODES.set ( value, node );

  return node;

};

const getNodeExisting = <T = StoreTarget> ( value: T ): StoreNode => {

  const node = NODES.get ( value );

  if ( !node ) throw new Error ();

  return node;

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

  const observable = new Observable ( value, options );

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

  if ( Array.isArray ( value ) ) return {};

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

const isListenable = (): boolean => { // Checks whether the current owner can listen for observables

  return ( OWNER.current instanceof Computation );

};

const isProxiable = ( value: unknown ): value is StoreTarget => { // Checks whether the value can be proxied

  if ( value === null || typeof value !== 'object' ) return false;

  if ( Array.isArray ( value ) ) return true;

  const prototype = Object.getPrototypeOf ( value );

  if ( prototype === null ) return true;

  return ( Object.getPrototypeOf ( prototype ) === null );

};

/* MAIN */

//TODO: Add an option for glitch-free batching, making it clear that that would break type-checking
//TODO: Add an option for immutable stores that are edited via set/merge/produce functions, which have none of the issues but poor DX
//TODO: Support listening to everything
//TODO: Support proxying more built-ins: ArrayBuffer, RegExp, Date, TypedArray, Map, WekaMap, Set, WeakSet
//TODO: Explore not using a WeakMap+cleanups and instead attaching the proxy to the object itself via a proxy

const store = <T> ( value: T, options?: StoreOptions ): T => {

  if ( !isProxiable ( value ) ) return value;

  if ( options?.unwrap ) return getTarget ( value );

  return getStore ( value );

};

/* EXPORT */

export default store;
