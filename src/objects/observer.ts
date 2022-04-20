
/* IMPORT */

import {OWNER} from '~/constants';
import type {IObservable, IObserver, CleanupFunction, ErrorFunction, ObservedFunction, Contexts, LazyArray, LazyObject} from '~/types';

/* MAIN */

class Observer {

  /* VARIABLES */

  parent: IObserver | null = null;
  cleanups: LazyArray<CleanupFunction> = null;
  contexts: LazyObject<Contexts> = null;
  errors: LazyArray<ErrorFunction> = null;
  observables: LazyArray<IObservable> = null;
  observers: LazyArray<IObserver> = null;

  /* REGISTRATION API */

  registerCleanup ( cleanup: CleanupFunction ): void {

    const {cleanups} = this;

    if ( cleanups ) {

      if ( cleanups instanceof Array ) {

        cleanups.push ( cleanup );

      } else {

        this.cleanups = [cleanups, cleanup];

      }

    } else {

      this.cleanups = cleanup;

    }

  }

  registerContext <T> ( symbol: symbol, value: T ): void {

    if ( this.contexts ) {

      this.contexts[symbol] = value;

    } else {

      this.contexts = { [symbol]: value };

    }

  }

  registerError ( error: ErrorFunction ): void {

    const {errors} = this;

    if ( errors ) {

      if ( errors instanceof Array ) {

        errors.push ( error );

      } else {

        this.errors = [errors, error];

      }

    } else {

      this.errors = error;

    }

  }

  registerObservable ( observable: IObservable ): void {

    const {observables} = this;

    if ( observables ) {

      if ( observables instanceof Array ) {

        observables.push ( observable );

      } else {

        this.observables = [observables, observable];

      }

    } else {

      this.observables = observable;

    }

  }

  registerObserver ( observer: IObserver ): void {

    const {observers} = this;

    if ( observers ) {

      if ( observers instanceof Array ) {

        observers.push ( observer );

      } else {

        this.observers = [observers, observer];

      }

    } else {

      this.observers = observer;

    }

  }

  /* API */

  context <T> ( symbol: symbol ): T | undefined {

    const {contexts} = this;

    if ( contexts && symbol in contexts ) return contexts[symbol];

    return this.parent?.context<T> ( symbol );

  }

  dispose ( deep?: boolean ): void {

    const {observers, observables, cleanups, errors, contexts} = this;

    if ( observers ) {
      this.observers = null;
      if ( observers instanceof Array ) {
        for ( let i = 0, l = observers.length; i < l; i++ ) {
          observers[i].dispose ( true );
        }
      } else {
        observers.dispose ( true );
      }
    }

    if ( observables ) {
      this.observables = null;
      if ( observables instanceof Array ) {
        for ( let i = 0, l = observables.length; i < l; i++ ) {
          const observable = observables[i];
          if ( observable.disposed ) continue;
          observable.unregisterObserver ( this );
        }
      } else {
        if ( !observables.disposed ) {
          observables.unregisterObserver ( this );
        }
      }
    }

    if ( cleanups ) {
      this.cleanups = null;
      if ( cleanups instanceof Array ) {
        for ( let i = 0, l = cleanups.length; i < l; i++ ) {
          cleanups[i]();
        }
      } else {
        cleanups ();
      }
    }

    if ( errors ) {
      this.errors = null;
    }

    if ( contexts ) {
      this.contexts = null;
    }

  }

  error ( error: unknown, silent: boolean ): boolean {

    const {errors} = this;

    if ( errors ) {

      if ( errors instanceof Array ) {

        errors.forEach ( fn => fn ( error ) );

      } else {

        errors ( error );

      }

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

    OWNER.current = this;

    let result: T;

    try {

      result = fn ();

    } catch ( error: unknown ) {

      this.error ( error, false );

    } finally {

      OWNER.current = ownerPrev;

    }

    return result!;

  }

}

/* EXPORT */

export default Observer;
