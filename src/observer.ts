
/* IMPORT */

import Observable from './observable';
import type {CleanupFunction, ErrorFunction, PlainObservable, PlainObserver} from './types';

/* MAIN */

const Observer = {

  /* REGISTRATION API */

  registerCleanup: ( observer: PlainObserver, cleanup: CleanupFunction ): void => {

    if ( observer.cleanups ) {

      observer.cleanups.push ( cleanup );

    } else {

      observer.cleanups = [cleanup];
    }

  },

  registerContext: <T> ( observer: PlainObserver, symbol: symbol, value: T ): T => {

    if ( observer.context ) {

      observer.context[symbol] = value;

    } else {

      observer.context = { [symbol]: value };

    }

    return value;

  },

  registerError: ( observer: PlainObserver, error: ErrorFunction ): void => {

    if ( observer.errors ) {

      observer.errors.push ( error );

    } else {

      observer.errors = [error];

    }

  },

  registerObservable: ( observer: PlainObserver, observable: PlainObservable ): void => {

    if ( observer.observables ) {

      observer.observables.push ( observable );

    } else {

      observer.observables = [observable];

    }

  },

  registerObserver: ( observer: PlainObserver, observer2: PlainObserver ): void => {

    if ( observer.observers ) {

      observer.observers.push ( observer2 );

    } else {

      observer.observers = [observer2];

    }

  },

  unregisterObserver ( observer: PlainObserver, observer2: PlainObserver ): void {

    if ( !observer.observers ) return;

    if ( observer.observers[observer.observers.length - 1] !== observer2 ) return; // Not strictly correct, but this function is only called when auto-disposing where this holds true, besides this function is not necessary for correctness

    observer.observers.pop ();

  },

  /* API */

  context: <T> ( observer: PlainObserver, symbol: symbol ): T | undefined => {

    const context = observer.context;

    if ( context && symbol in context ) return context[symbol];

    const parent = observer.parent;

    if ( !parent ) return;

    return Observer.context ( parent, symbol );

  },

  error: ( observer: PlainObserver, error: unknown, silent?: boolean ): boolean => {

    const errors = observer.errors;

    if ( errors ) {

      errors.forEach ( fn => fn ( error ) );

      return true;

    } else {

      const parent = observer.parent;

      if ( parent ) {

        if ( Observer.error ( parent, error, true ) ) return true;

      }

      if ( silent ) {

        return false;

      } else {

        throw error;

      }

    }

  },

  dispose: ( observer: PlainObserver ): void => {

    const {observers, observables, cleanups, errors, context} = observer;

    if ( observers ) {
      observer.observers = null;
      for ( let i = 0, l = observers.length; i < l; i++ ) {
        const observer = observers[i];
        if ( 'observable' in observer ) {
          Observable.dispose ( observer.observable );
        }
        Observer.dispose ( observer );
      }
    }

    if ( observables ) {
      observer.observables = null;
      for ( let i = 0, l = observables.length; i < l; i++ ) {
        const observable = observables[i];
        if ( observable.disposed ) return;
        Observable.unregisterObserver ( observable, observer );
      }
    }

    if ( cleanups ) {
      observer.cleanups = null;
      for ( let i = 0, l = cleanups.length; i < l; i++ ) {
        cleanups[i]();
      }
    }

    if ( errors ) {
      observer.errors = null;
    }

    if ( context ) {
      observer.context = null;
    }

  }

};

/* EXPORT */

export default Observer;
