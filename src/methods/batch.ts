
/* IMPORT */

import {BATCH} from '~/constants';
import type {IObservable, BatchFunction} from '~/types';

/* HELPERS */

const flush = <T> ( value: T, observable: IObservable<T> ): T => observable.write ( value );
const stale = <T> ( value: T, observable: IObservable<T> ): void => observable.stale ( false );
const unstale = <T> ( value: T, observable: IObservable<T> ): void => observable.unstale ( false );

/* MAIN */

//TODO: Experiment with deleting batching and instead just queuing effects in a microtask

const batch = <T> ( fn: BatchFunction<T> ): T => {

  if ( BATCH.current ) { // Already batching

    return fn ();

  } else { // Starting batching

    const batch = BATCH.current = new Map ();

    try {

      return fn ();

    } finally {

      BATCH.current = undefined;

      if ( batch.size > 1 ) {

        batch.forEach ( stale );
        batch.forEach ( flush );
        batch.forEach ( unstale );

      } else {

        batch.forEach ( flush );

      }

    }

  }

};

/* MAIN */

export default batch;
