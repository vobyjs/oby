
/* IMPORT */

import {OWNER, TRACKING, setOwner, setTracking} from '~/context';
import {lazyArrayEach, lazyArrayEachRight, lazyArrayPush, lazySetAdd, lazySetDelete} from '~/lazy';
import {castError} from '~/utils';
import type {IObservable, IObserver, IRoot, CleanupFunction, ErrorFunction, ObservedFunction, Callable, Contexts, LazyArray, LazySet, LazyValue, Signal} from '~/types';

/* MAIN */

//TODO: Throw when registering stuff after disposing, mainly relevant when roots are used

class Observer {

  /* VARIABLES */

  parent?: IObserver;
  signal?: Signal;
  cleanups?: LazyArray<Callable<CleanupFunction>>;
  contexts?: LazyValue<Contexts>;
  errors?: LazyArray<Callable<ErrorFunction>>;
  observables?: LazyArray<IObservable>;
  observablesLeftover?: LazyArray<IObservable>;
  observers?: LazyArray<IObserver>;
  roots?: LazySet<IRoot | (() => IRoot[])>;
  inactive?: boolean; // Inactive observers should not be re-executed, if they can be

  /* REGISTRATION API */

  registerCleanup ( cleanup: Callable<CleanupFunction> ): void {

    lazyArrayPush ( this, 'cleanups', cleanup );

  }

  registerError ( error: Callable<ErrorFunction> ): void {

    lazyArrayPush ( this, 'errors', error );

  }

  registerObservable ( observable: IObservable ): void {

    lazyArrayPush ( this, 'observables', observable );

  }

  registerObserver ( observer: IObserver ): void {

    lazyArrayPush ( this, 'observers', observer );

  }

  registerRoot ( root: IRoot | (() => IRoot[]) ): void {

    lazySetAdd ( this, 'roots', root );

  }

  unregisterRoot ( root: IRoot | (() => IRoot[]) ): void {

    lazySetDelete ( this, 'roots', root );

  }

  /* API */

  catch ( error: Error, silent: boolean ): boolean {

    const {errors, parent} = this;

    if ( errors ) {

      try {

        lazyArrayEach ( errors, fn => fn.call ( fn, error ) );

      } catch ( error: unknown ) {

        if ( parent ) {

          parent.catch ( castError ( error ), false );

        } else {

          throw error;

        }

      }

      return true;

    } else {

      if ( parent?.catch ( error, true ) ) return true;

      if ( silent ) {

        return false;

      } else {

        console.error ( error.stack ); // For convenience

        throw error;

      }

    }

  }

  dispose ( deep?: boolean, immediate?: boolean ): void {

    const {observers, observables, cleanups, errors, contexts} = this;

    if ( observers ) {
      this.observers = undefined;
      lazyArrayEachRight ( observers, observer => {
        observer.dispose ( true, true );
      });
    }

    if ( observables ) {
      this.observables = undefined;
      if ( immediate ) {
        lazyArrayEach ( observables, observable => {
          if ( !observable.disposed && !observable.signal.disposed ) {
            observable.unregisterObserver ( this );
          }
        });
      } else {
        this.observablesLeftover = observables;
      }
    }

    if ( cleanups ) {
      this.cleanups = undefined;
      this.inactive = true;
      lazyArrayEachRight ( cleanups, cleanup => cleanup.call ( cleanup ) );
      this.inactive = false;
    }

    if ( errors ) {
      this.errors = undefined;
    }

    if ( contexts ) {
      this.contexts = undefined;
    }

  }

  postdispose (): void {

    const prev = this.observablesLeftover;

    if ( !prev ) return;

    this.observablesLeftover = undefined;

    const next = this.observables;

    if ( prev === next ) return;

    const a = ( prev instanceof Array ) ? prev : [prev];
    const b = ( next instanceof Array ) ? next : ( next ? [next] : [] );

    let bSet: Set<IObservable> | undefined;

    for ( let ai = 0, al = a.length; ai < al; ai++ ) { // Unlinking from previous Observables which are not next Observables too
      const av = a[ai];
      if ( av.disposed || av.signal.disposed ) continue;
      if ( av === b[ai] ) continue;
      bSet ||= new Set ( b );
      if ( bSet.has ( av ) ) continue;
      av.unregisterObserver ( this );
    }

  }

  read <T> ( symbol: symbol ): T | undefined {

    const {contexts, parent} = this;

    if ( contexts && symbol in contexts ) return contexts[symbol];

    return parent?.read<T> ( symbol );

  }

  write <T> ( symbol: symbol, value: T ): void {

    this.contexts ||= {};
    this.contexts[symbol] = value;

  }

  wrap <T> ( fn: ObservedFunction<T>, tracking: boolean = false ): T {

    const ownerPrev = OWNER;
    const trackingPrev = TRACKING;

    setOwner ( this );
    setTracking ( tracking );

    let result!: T; //TSC

    try {

      result = fn ();

    } catch ( error: unknown ) {

      this.catch ( castError ( error ), false );

    } finally {

      setOwner ( ownerPrev );
      setTracking ( trackingPrev );

    }

    return result;

  }

}

/* EXPORT */

export default Observer;
