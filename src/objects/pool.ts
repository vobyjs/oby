
/* IMPORT */

import type {IObservable, IObserver, IOwner, IRoot, ISuspense, CleanupFunction, ErrorFunction, WrappedFunction, Callable, Contexts} from '~/types';

/* MAIN - GENERAL */

//TODO: Think more about the GC aspect of this
//TODO: Rename these methods, and trim out the unused ones

abstract class PoolAbstract<K, V, VV> {

  /* VARIABLES */

  private active: Map<K, V> = new Map ();
  private available: V[] = [];

  /* POOL API */

  delete ( key: K ): void {

    const value = this.active.get ( key );

    if ( !value ) return;

    this.clear ( value );

    this.active.delete ( key );
    this.available.push ( value );

  }

  get ( key: K ): V | undefined {

    return this.active.get ( key );

  }

  getOrCreate ( key: K ): V {

    const value = this.active.get ( key );

    if ( value ) return value;

    const value2 = this.available.pop () || this.create (); //TODO: stupid variable name

    this.active.set ( key, value2 );

    return value2;

  }

  forEach ( key: K, callback: ( value: VV ) => boolean | void ): void {

    const value = this.active.get ( key );

    if ( !value ) return;

    this.iterate ( value, callback );

  }

  forEachRight ( key: K, callback: ( value: VV ) => boolean | void ): void {

    const value = this.active.get ( key );

    if ( !value ) return;

    this.iterateRight ( value, callback );

  }

  forEachAndDelete ( key: K, callback: ( value: VV ) => boolean | void ): void {

    const value = this.active.get ( key );

    if ( !value ) return;

    this.iterate ( value, callback );
    this.clear ( value );

    this.active.delete ( key );
    this.available.push ( value );

  }

  forEachRightAndDelete ( key: K, callback: ( value: VV ) => boolean | void ): void {

    const value = this.active.get ( key );

    if ( !value ) return;

    this.iterateRight ( value, callback );
    this.clear ( value );

    this.active.delete ( key );
    this.available.push ( value );

  }

  forEachAndReset ( key: K, callback: ( value: VV ) => boolean | void ): void {

    const value = this.active.get ( key );

    if ( !value ) return;

    this.iterate ( value, callback );
    this.clear ( value );

  }

  forEachRightAndReset ( key: K, callback: ( value: VV ) => boolean | void ): void {

    const value = this.active.get ( key );

    if ( !value ) return;

    this.iterateRight ( value, callback );
    this.clear ( value );

  }

  reset ( key: K ): void {

    const value = this.active.get ( key );

    if ( !value ) return;

    this.clear ( value );

  }

  register ( key: K, vvalue: VV ): void {

    const value = this.getOrCreate ( key );

    this.push ( value, vvalue );

  }

  unregister ( key: K, vvalue: VV ): void {

    const value = this.active.get ( key );

    if ( !value ) return;

    this.pop ( value, vvalue );

  }

  /* VALUE API */

  abstract clear ( value: V ): void;

  abstract create (): V;

  abstract iterate ( value: V, callback: ( value: VV ) => boolean | void ): void;

  abstract iterateRight ( value: V, callback: ( value: VV ) => boolean | void ): void;

  abstract push ( value: V, vvalue: VV ): void;

  abstract pop ( value: V, vvalue: VV ): void;

}

class PoolArray<K, V> extends PoolAbstract<K, V[], V> {

  /* VALUE API */

  clear ( value: V[] ): void {

    value.length = 0;

  }

  create (): V[] {

    return [];

  }

  iterate ( value: V[], callback: ( value: V ) => boolean | void ): void {

    for ( let i = 0, l = value.length; i < l; i++ ) {

      if ( callback ( value[i] ) === false ) break;

    }

  }

  iterateRight ( value: V[], callback: ( value: V ) => boolean | void ): void {

    for ( let i = value.length - 1; i >= 0; i-- ) {

      if ( callback ( value[i] ) === false) break;

    }

  }

  push ( value: V[], vvalue: V ): void {

    value.push ( vvalue );

  }

  pop ( value: V[], vvalue: V ): void {

   const index = value.indexOf ( vvalue );

    if ( index === -1 ) return;

    value.splice ( index, 1 );

  }

}

class PoolSet<K, V> extends PoolAbstract<K, Set<V>, V> {

  /* VALUE API */

  clear ( value: Set<V> ): void {

    value.clear ();

  }

  create (): Set<V> {

    return new Set ();

  }

  iterate ( value: Set<V>, callback: ( value: V ) => boolean | void ): void {

    for ( const vvalue of value ) {

      if ( callback ( vvalue ) === false ) break;

    }

  }

  iterateRight ( value: Set<V>, callback: ( value: V ) => boolean | void ): void {

    for ( const vvalue of value ) { //FIXME: It doesn't iterate from the right though

      if ( callback ( vvalue ) === false ) break;

    }

  }

  push ( value: Set<V>, vvalue: V ): void {

    value.add ( vvalue );

  }

  pop ( value: Set<V>, vvalue: V ): void {

    value.delete ( vvalue );

  }

}

abstract class PoolValue<T, Args extends unknown[]> {

  /* VARIABLES */

  private values: T[] = [];

  /* POOL API */

  alloc ( ...args: Args ): T {

    const existing = this.values.pop ();

    if ( existing ) console.log ( 'reusing' );

    return this.hydrate ( existing || this.create (), ...args );

  }

  free ( value: T ): void {
console.log('free');

    this.values.push ( this.dehydrate ( value ) );

  }

  /* VALUE API */

  abstract create (): T;

  abstract hydrate ( value: T, ...args: Args ): T;

  abstract dehydrate ( value: T ): T;

}

/* MAIN - SPECIALIZED */

const PoolObservableObservers = new PoolSet<IObservable, IObserver> ();

const PoolObserverObservables = new PoolSet<IObserver, IObservable> ();

const PoolOwnerCleanups = new PoolArray<IOwner, Callable<CleanupFunction>> ();
const PoolOwnerObservers = new PoolArray<IOwner, IObserver> ();
const PoolOwnerRoots = new PoolSet<IOwner, IRoot | (() => IRoot[])> ();
const PoolOwnerSuspenses = new PoolArray<IOwner, ISuspense> ();

/* EXPORT */

export {PoolAbstract, PoolArray, PoolSet, PoolValue};
export {PoolObservableObservers, PoolObserverObservables, PoolOwnerCleanups, PoolOwnerObservers, PoolOwnerRoots, PoolOwnerSuspenses};
