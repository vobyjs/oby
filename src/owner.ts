
/* IMPORT */

import Observable from './observable';
import Observer from './observer';
import SuperRoot from './superroot';
import type {CleanupFunction, ErrorFunction, OwnerFunction, PlainObservable, PlainObserver} from './types';

/* HELPERS */

let superowner = SuperRoot.create ();
let owner: PlainObserver = superowner;
let isSampling = false;

/* MAIN */

const Owner = {

  /* REGISTRATION API */

  registerCleanup: ( cleanup: CleanupFunction ): void => {

    Observer.registerCleanup ( owner, cleanup );

  },

  registerError: ( error: ErrorFunction ): void => {

    Observer.registerError ( owner, error );

  },

  registerObservable: ( observable: PlainObservable ): void => {

    if ( isSampling ) return;

    if ( !( 'fn' in owner ) ) return;

    const isNewObserver = Observable.registerObserver ( observable, owner );

    if ( !isNewObserver ) return;

    Observer.registerObservable ( owner, observable );

  },

  registerObserver: ( observer: PlainObserver ): void => {

    Observer.registerObserver ( owner, observer );

  },

  unregisterObserver: ( observer: PlainObserver ): void => {

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

        return fn ();

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

  }

};

/* EXPORT */

export default Owner;
