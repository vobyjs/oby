
/* IMPORT */

import Observable from './observable';
import Observer from './observer';
import {CleanupFunction, OwnerFunction, ErrorFunction} from './types';

/* MAIN */

class Owner {

  /* VARIABLES */

  private observer?: Observer;
  private sampling: boolean = false;

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

    if ( this.sampling ) return;

    if ( observable.hasObserver ( this.observer ) ) return;

    this.observer.registerObservable ( observable );

    observable.registerObserver ( this.observer );

  };

  registerObservables = ( observables: Observable[] ): void => {

    if ( !this.observer ) return;

    if ( this.sampling ) return;

    observables.forEach ( this.registerObservable );

  };

  registerObserver = ( observer: Observer ): void => {

    if ( !this.observer ) return;

    this.observer.registerObserver ( observer );

    observer.registerParent ( this.observer );

  };

  unregisterObserver = ( observer: Observer ): void => {

    if ( !this.observer ) return;

    this.observer.unregisterObserver ( observer );

    observer.unregisterParent ();

  }

  /* WRAPPING API */

  wrap = <T> ( fn: OwnerFunction<T> ): void => {

    const parent = this.observer;
    const observer = new Observer ();

    if ( parent ) {

      observer.registerParent ( parent );

    }

    try {

      this.wrapWith ( fn, observer, true );

    } catch ( error: unknown ) {

      observer.updateError ( error );

    }

  };

  wrapWith = <T> ( fn: OwnerFunction<T>, observer?: Observer, disposable?: boolean, sampling?: boolean ): T => {

    const observerPrev = this.observer;
    const samplingPrev = this.sampling;

    this.observer = observer;
    this.sampling = !!sampling;

    try {

      if ( observer && disposable ) {

        const dispose = this.dispose.bind ( this, observer );

        return fn ( dispose );

      } else {

        return ( fn as any )(); //TSC

      }

    } finally {

      this.observer = observerPrev;
      this.sampling = samplingPrev;

    }

  };

  wrapWithout = <T> ( fn: OwnerFunction<T> ): T => {

    return this.wrapWith ( fn );

  };

  wrapWithSampling = <T> ( fn: OwnerFunction<T> ): T => {

    return this.wrapWith ( fn, this.observer, false, true );

  };

  /* API */

  dispose = ( observer: Observer ): void => {

    //TODO: Maybe throw if disposing a root different from the current one, or implement this properly, setting the _current_ observer to undefined is a mistake

    Observer.unsubscribe ( observer );

    this.observer = undefined;

  };

  get = (): Observer | undefined => {

    return this.observer;

  };

}

/* EXPORT */

export default new Owner ();
