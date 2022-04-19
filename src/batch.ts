
/* IMPORT */

import Observable from './observable';
import type {BatchFunction, PlainObservable} from './types';

/* MAIN */

const batch = ( fn: BatchFunction ): void => {

  if ( batch.queue ) { // Already batching

    fn ();

  } else { // Starting batching

    const queue = batch.queue = new Map<PlainObservable<any, any>, unknown> ();

    try {

      fn ();

    } finally {

      batch.queue = null;

      queue.forEach ( ( value, observable ) => {

        Observable.set ( observable, value );

      });

    }

  }

};

/* UTILITIES */

batch.queue = <Map<PlainObservable<any, any>, unknown> | null> null;

/* EXPORT */

export default batch;
