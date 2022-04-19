
/* IMPORT */

import Observable from './observable';
import type {CleanupFunction, ErrorFunction, PlainObservable, PlainObserver, PlainRoot} from './types';

/* MAIN */

const Observer = {

  /* REGISTRATION API */

  registerCleanup: ( observer: PlainObserver, cleanup: CleanupFunction ): void => {

    if ( observer.cleanups ) {

      if ( observer.cleanups instanceof Array ) {

        observer.cleanups.push ( cleanup );

      } else {

        observer.cleanups = [observer.cleanups, cleanup];

      }

    } else {

      observer.cleanups = cleanup;

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

      if ( observer.errors instanceof Array ) {

        observer.errors.push ( error );

      } else {

        observer.errors = [observer.errors, error];

      }

    } else {

      observer.errors = error;

    }

  },

  registerObservable: ( observer: PlainObserver, observable: PlainObservable<any, any> ): void => {

    if ( observer.observables ) {

      if ( observer.observables instanceof Array ) {

        observer.observables.push ( observable );

      } else {

        observer.observables = [observer.observables, observable];

      }

    } else {

      observer.observables = observable;

    }

  },

  registerObserver: ( observer: PlainObserver, observer2: PlainObserver ): void => {

    if ( observer.observers ) {

      if ( observer.observers instanceof Array ) {

        observer.observers.push ( observer2 );

      } else {

        observer.observers = [observer.observers, observer2];

      }

    } else {

      observer.observers = observer2;

    }

  },

  unregisterObserver: ( observer: PlainObserver, observer2: PlainObserver ): void => {

    if ( !observer.observers ) return;

    if ( observer.observers instanceof Array ) {

      if ( observer.observers[observer.observers.length - 1] !== observer2 ) return; // Not strictly correct, but this function is only called when auto-disposing where this holds true, besides this function is not necessary for correctness

      observer.observers.pop ();

    } else if ( observer.observers === observer2 ) {

      observer.observers = null;

    }

  },

  registerRoot: ( observer: PlainObserver, _root: PlainRoot ): void => {

    observer.roots += 1;

  },

  unregisterRoot: ( observer: PlainObserver, _root: PlainRoot ): void => {

    observer.roots -= 1;

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

      if ( errors instanceof Array ) {

        errors.forEach ( fn => fn ( error ) );

      } else {

        errors ( error );

      }

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
      if ( observers instanceof Array ) {
        for ( let i = 0, l = observers.length; i < l; i++ ) {
          const observer = observers[i];
          if ( 'observable' in observer ) {
            Observable.dispose ( observer.observable );
          }
          Observer.dispose ( observer );
        }
      } else {
        if ( 'observable' in observers ) {
          Observable.dispose ( observers.observable );
        }
        Observer.dispose ( observers );
      }
    }

    if ( observables ) {
      observer.observables = null;
      if ( observables instanceof Array ) {
        for ( let i = 0, l = observables.length; i < l; i++ ) {
          const observable = observables[i];
          if ( observable.disposed ) return;
          Observable.unregisterObserver ( observable, observer );
        }
      } else {
        if ( !observables.disposed ) {
          Observable.unregisterObserver ( observables, observer );
        }
      }
    }

    if ( cleanups ) {
      observer.cleanups = null;
      if ( cleanups instanceof Array ) {
        for ( let i = 0, l = cleanups.length; i < l; i++ ) {
          cleanups[i]();
        }
      } else {
        cleanups ();
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
