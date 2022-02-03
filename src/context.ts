
/* IMPORT */

import {NOOP} from './constants';
import Observable from './observable';
import Observer from './observer';
import {CleanupFunction, ContextFunction, ErrorFunction} from './types';

/* MAIN */

class Context {

  /* VARIABLES */

  private observer?: Observer;

  /* REGISTRATION API */

  registerCleanup = ( cleanup: CleanupFunction ): void => {

    if ( !this.observer ) return;

    this.observer.registerCleanup ( cleanup );

  };

  registerError = ( error: ErrorFunction ): void => {

    if ( !this.observer ) return;

    this.observer.registerError ( error );

  };

  registerObservable = ( observable: Observable ): void => {

    if ( !this.observer ) return;

    if ( observable.hasObserver ( this.observer ) ) return;

    this.observer.registerObservable ( observable );

    observable.registerObserver ( this.observer );

  };

  registerObservables = ( observables: Observable[] ): void => {

    if ( !this.observer ) return;

    observables.forEach ( this.registerObservable );

  };

  registerObserver = ( observer: Observer ): void => {

    if ( !this.observer ) return;

    this.observer.registerObserver ( observer );

  };

  unregisterObserver = ( observer: Observer ): void => {

    if ( !this.observer ) return;

    this.observer.unregisterObserver ( observer );

  }

  /* WRAPPING API */

  wrap = <T> ( fn: ContextFunction<T> ): T | undefined => {

    const observer = new Observer ();

    try {

      return this.wrapWith ( fn, observer, true );

    } catch ( error: unknown ) {

      observer.updateError ( error );

    }

  };

  wrapVoid = <T> ( fn: ContextFunction<T> ): void => {

    this.wrap ( fn );

  };

  wrapWith = <T> ( fn: ContextFunction<T>, observer?: Observer, disposable?: boolean ): T => {

    const observerPrev = this.observer;

    this.observer = observer;

    try {

      const dispose = ( observer && disposable ) ? () => this.dispose ( observer ) : NOOP;

      return fn ( dispose );

    } finally {

      this.observer = observerPrev;

    }

  };

  wrapWithout = <T> ( fn: ContextFunction<T> ): T => {

    return this.wrapWith ( fn );

  };

  /* API */

  dispose = ( observer: Observer ): void => {

    //TODO: Maybe throw if disposing a root different from the current one, or implement this properly, setting the _current_ observer to undefined is a mistake

    Observer.unsubscribe ( observer );

    this.observer = undefined;

  };

}

/* EXPORT */

export default new Context ();
