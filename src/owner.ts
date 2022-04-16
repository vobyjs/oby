
/* IMPORT */

import {NOOP} from './constants';
import Observable from './observable';
import Observer from './observer';
import SuperRoot from './superroot';
import type {CleanupFunction, ErrorFunction, OwnerFunction, PlainObservable, PlainObserver, ObserverPublic} from './types';

/* HELPERS */

let superowner = SuperRoot.create ();
let owner: PlainObserver = superowner;
let isSampling = false;

/* MAIN */

const Owner = {

  /* REGISTRATION API */

  registerCleanup: ( cleanup: CleanupFunction ): void => {

    if ( owner === superowner ) return; //TODO: Show error message during development

    Observer.registerCleanup ( owner, cleanup );

  },

  registerError: ( error: ErrorFunction ): void => {

    if ( owner === superowner ) return; //TODO: Delete this, just a test

    Observer.registerError ( owner, error );

  },

  registerObservable: ( observable: PlainObservable ): void => {

    if ( isSampling ) return;

    if ( owner.symbol === 5 || owner.symbol === 6 ) return;

    const isNewObserver = Observable.registerObserver ( observable, owner );

    if ( !isNewObserver ) return;

    Observer.registerObservable ( owner, observable );

  },

  registerObserver: ( observer: PlainObserver ): void => {

    if ( owner === superowner ) return; //TODO: Show error message during development

    Observer.registerObserver ( owner, observer );

  },

  unregisterObserver: ( observer: PlainObserver ): void => {

    if ( owner === superowner ) return;

    Observer.unregisterObserver ( owner, observer );

  },

  /* WRAPPING API */

  wrapWith: <T> ( fn: OwnerFunction<T>, observer?: PlainObserver, disposable?: boolean, sampling?: boolean ): T => {

    const ownerPrev = owner;
    const samplingPrev = isSampling;

    owner = observer || superowner;
    isSampling = !!sampling;

    try {

      if ( observer && disposable ) {

        const dispose = Owner.dispose.bind ( undefined, observer );

        return fn ( dispose );

      } else {

        return ( fn as any )(); //TSC

      }

    } finally {

      owner = ownerPrev;
      isSampling = samplingPrev;

    }

  },

  wrapWithSampling: <T> ( fn: OwnerFunction<T> ): T => {

    return Owner.wrapWith ( fn, owner, false, true );

  },

  /* API */

  dispose: ( observer: PlainObserver ): void => {

    //TODO: Maybe throw if disposing a root different from the current one, or implement this properly, setting the _current_ observer to undefined is a mistake

    Observer.dispose ( observer );

    owner = superowner;

  },

  get: (): PlainObserver => {

    return owner;

  },

  getPublic: (): ObserverPublic => {

    const dispose = ( owner !== superowner ) ? Observer.dispose.bind ( undefined, owner ) : NOOP;

    return { dispose };

  }

};

/* EXPORT */

export default Owner;
