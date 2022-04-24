
/* IMPORT */

import type {IObservable, BatchFunction} from '~/types';

/* MAIN */

const batch = <T> ( fn: BatchFunction<T> ): T => {

  if ( batch.queue ) { // Already batching

    return fn ();

  } else { // Starting batching

    const queue = batch.queue = new Map ();

    try {

      return fn ();

    } finally {

      batch.queue = undefined;

      queue.forEach ( batch.flush );

    }

  }

};

/* UTILITIES */

batch.flush = <T> ( value: T, observable: IObservable<T> ): T => observable.set ( value );

batch.queue = <Map<IObservable<any, any>, unknown> | undefined> undefined;

/* MAIN */

export default batch;
