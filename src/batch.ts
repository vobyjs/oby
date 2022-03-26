
/* IMPORT */

import Observable from './observable';
import {BatchFunction} from './types';

/* MAIN */

const batch = ( fn: BatchFunction ): void => {

  if ( batch.queue ) { // Already batching

    fn ();

  } else { // Starting batching

    const queue = batch.queue = new Map ();

    try {

      fn ();

    } finally {

      batch.queue = undefined;

      queue.forEach ( ( value, observable ) => {

        observable.set ( value );

      });

    }

  }

};

/* UTILITIES */

batch.queue = <Map<Observable, unknown> | undefined> undefined;

/* EXPORT */

export default batch;
