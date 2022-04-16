
/* IMPORT */

import Observable from './observable';
import type {BatchFunction, PlainObservable} from './types';

/* MAIN */

const batch = ( fn: BatchFunction ): void => {

  if ( batch.queue ) { // Already batching

    fn ();

  } else { // Starting batching

    const queue = batch.queue = new Map<PlainObservable, unknown> ();

    try {

      fn ();

    } finally {

      batch.queue = undefined;

      queue.forEach ( ( value, observable ) => {

        Observable.set ( observable, value );

      });

    }

  }

};

/* UTILITIES */

batch.queue = <Map<PlainObservable, unknown> | undefined> undefined;

/* EXPORT */

export default batch;
