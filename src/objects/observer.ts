
/* IMPORT */

import {OWNER, SAMPLING} from '~/constants';
import {lazyArrayEach, lazyArrayPush} from '~/lazy';
import {castError} from '~/utils';
import type {IObservable, IObserver, ISignal, CleanupFunction, ErrorFunction, ObservedFunction, Contexts, LazyArray, LazyValue} from '~/types';

/* MAIN */

class Observer {

  /* VARIABLES */

  parent?: IObserver;
  signal?: ISignal;
  cleanups?: LazyArray<CleanupFunction>;
  contexts?: LazyValue<Contexts>;
  errors?: LazyArray<ErrorFunction>;
  observables?: LazyArray<IObservable>;
  observablesLeftover?: LazyArray<IObservable>;
  observers?: LazyArray<IObserver>;

  /* REGISTRATION API */

  registerCleanup ( cleanup: CleanupFunction ): void {

    lazyArrayPush ( this, 'cleanups', cleanup );

  }

  registerContext <T> ( symbol: symbol, value: T ): void {

    this.contexts ||= {};
    this.contexts[symbol] = value;

  }

  registerError ( error: ErrorFunction ): void {

    lazyArrayPush ( this, 'errors', error );

  }

  registerObservable ( observable: IObservable ): void {

    lazyArrayPush ( this, 'observables', observable );

  }

  registerObserver ( observer: IObserver ): void {

    lazyArrayPush ( this, 'observers', observer );

  }

  /* API */

  context <T> ( symbol: symbol ): T | undefined {

    const {contexts} = this;

    if ( contexts && symbol in contexts ) return contexts[symbol];

    return this.parent?.context<T> ( symbol );

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
      lazyArrayEach ( cleanups, cleanup => cleanup () );
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
      if ( av === b[ai] ) continue;
      for ( let bi = 0, bl = b.length; bi < bl; bi++ ) {
        if ( av === b[bi] ) continue outer;
      }
      av.unregisterObserver ( this );
    }

  }

  error ( error: Error, silent: boolean ): boolean {

    const {errors} = this;

    if ( errors ) {

      lazyArrayEach ( errors, fn => fn ( error ) );

      return true;

    } else {

      if ( this.parent?.error ( error, true ) ) return true;

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
