
/* IMPORT */

import {OWNER, SAMPLING} from '~/constants';
import {lazyArrayEach, lazyArrayPush, lazySetAdd, lazySetDelete} from '~/lazy';
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

  registerContext <T> ( symbol: symbol, value: T ): void {

    this.contexts ||= {};
    this.contexts[symbol] = value;

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

  context <T> ( symbol: symbol ): T | undefined {

    const {contexts, parent} = this;

    if ( contexts && symbol in contexts ) return contexts[symbol];

    return parent?.context<T> ( symbol );

  }

  dispose ( deep?: boolean, immediate?: boolean ): void {

    const {observers, observables, cleanups, errors, contexts} = this;

    if ( observers ) {
      this.observers = undefined;
      lazyArrayEach ( observers, observer => {
        observer.dispose ( true, immediate );
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
      lazyArrayEach ( cleanups, cleanup => cleanup.call ( cleanup ) );
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
    const next = this.observables;

    if ( !prev ) return;

    this.observablesLeftover = undefined;

    if ( prev === next ) return;

    const a = ( prev instanceof Array ) ? prev : [prev];
    const b = ( next instanceof Array ) ? next : [next];

    outer:
    for ( let ai = 0, al = a.length; ai < al; ai++ ) {
      const av = a[ai];
      if ( av.disposed || av.signal.disposed ) continue;
      if ( av === b[ai] ) continue;
      for ( let bi = 0, bl = b.length; bi < bl; bi++ ) {
        if ( av === b[bi] ) continue outer;
      }
      av.unregisterObserver ( this );
    }

  }

  error ( error: Error, silent: boolean ): boolean {

    const {errors, parent} = this;

    if ( errors ) {

      lazyArrayEach ( errors, fn => fn.call ( fn, error ) );

      return true;

    } else {

      if ( parent?.error ( error, true ) ) return true;

      if ( silent ) {

        return false;

      } else {

        throw error;

      }

    }

  }

  wrap <T> ( fn: ObservedFunction<T> ): T {

    const ownerPrev = OWNER.current;
    const samplingPrev = SAMPLING.current;

    OWNER.current = this;
    SAMPLING.current = false;

    let result: T;

    try {

      result = fn ();

    } catch ( error: unknown ) {

      this.error ( castError ( error ), false );

    } finally {

      OWNER.current = ownerPrev;
      SAMPLING.current = samplingPrev;

    }

    return result!;

  }

}

/* EXPORT */

export default Observer;
