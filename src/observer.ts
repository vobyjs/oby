
/* IMPORT */

import Computed from './computed';
import Effect from './effect';
import Observable from './observable';
import type {CleanupFunction, ErrorFunction, PlainObservable, PlainObserver} from './types';

/* MAIN */

const Observer = {

  /* REGISTRATION API */

  registerCleanup: ( observer: PlainObserver, cleanup: CleanupFunction ): void => {

    observer.cleanups.push ( cleanup );

  },

  registerContext: <T> ( observer: PlainObserver, symbol: symbol, value: T ): T => {

    return observer.context[symbol] = value;

  },

  registerError: ( observer: PlainObserver, error: ErrorFunction ): void => {

    observer.errors.push ( error );

  },

  registerObservable: ( observer: PlainObserver, observable: PlainObservable ): void => {

    observer.observables.push ( observable );

  },

  registerObserver: ( observer: PlainObserver, observer2: PlainObserver ): void => {

    observer.observers.push ( observer2 );

  },

  unregisterObserver ( observer: PlainObserver, observer2: PlainObserver ): void {

    //TODO: Make this never slow, it's still ok if things are not deleted

    observer.observers = observer.observers.filter ( observer => observer !== observer2 );

  },

  /* API */

  onStale: ( observer: PlainObserver, fresh: boolean ): void => {

    observer.staleCount += 1;

    if ( fresh ) {

      observer.staleFresh = true;

    }

  },

  onUnstale: ( observer: PlainObserver, fresh: boolean ): void => {

    if ( !observer.staleCount ) return; //TODO: If this happens is probably an error

    observer.staleCount -= 1;

    if ( fresh ) {

      observer.staleFresh = true;

    }

    if ( !observer.staleCount ) {

      const fresh = observer.staleFresh;

      observer.staleFresh = false;

      Observer.update ( observer, fresh );

    }

  },

  update: ( observer: PlainObserver, fresh: boolean ): void => {

    if ( observer.symbol === 3 ) {

      Computed.update ( observer, fresh );

    }

    if ( observer.symbol === 4 ) {

      Effect.update ( observer, fresh );

    }

  },

  updateContext: <T> ( observer: PlainObserver, symbol: symbol ): T | undefined => {

    const {context, parent} = observer;

    if ( context && symbol in context ) return context[symbol];

    if ( !parent ) return;

    return Observer.updateContext ( parent, symbol );

  },

  updateError: ( observer: PlainObserver, error: unknown, silent?: boolean ): boolean => {

    const {errors, parent} = observer;

    if ( errors.length ) {

      errors.forEach ( fn => fn ( error ) );

      return true;

    } else {

      if ( parent ) {

        if ( Observer.updateError ( parent, error, true ) ) return true;

      }

      if ( !silent ) {

        throw error;

      } else {

        return false;

      }

    }

  },

  dispose: ( observer: PlainObserver ): void => {

    const {observers, observables, cleanups, errors, context} = observer;

    if ( observers.length ) {
      observer.observers = [];
      for ( let i = 0, l = observers.length; i < l; i++ ) {
        Observer.dispose ( observers[i] );
      }
    }

    if ( observables.length ) {
      observer.observables = [];
      for ( let i = 0, l = observables.length; i < l; i++ ) {
        const observable = observables[i];
        if ( observable.disposed ) continue;
        Observable.unregisterObserver ( observable, observer );
      }
    }

    if ( cleanups.length ) {
      observer.cleanups = [];
      for ( let i = 0, l = cleanups.length; i < l; i++ ) {
        cleanups[i]();
      }
    }

    if ( errors.length ) {
      observer.errors = [];
    }

    if ( context ) {
      observer.context = {};
    }

  }

};

/* EXPORT */

export default Observer;
