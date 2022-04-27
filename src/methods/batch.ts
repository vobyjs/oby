
/* IMPORT */

import {BATCH} from '~/constants';
import type {IObservable, BatchFunction} from '~/types';

/* HELPERS */

const flush = <T> ( value: T, observable: IObservable<T> ): T => observable.write ( value );

/* MAIN */

const batch = <T> ( fn: BatchFunction<T> ): T => {

  if ( BATCH.current ) { // Already batching

    return fn ();

  } else { // Starting batching

    const batch = BATCH.current = new Map ();

    try {

      return fn ();

    } finally {

      BATCH.current = undefined;

      batch.forEach ( flush );

    }

  }

};

/* MAIN */

export default batch;
