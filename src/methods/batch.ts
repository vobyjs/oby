
/* IMPORT */

import {BATCH} from '~/constants';
import {isFunction} from '~/utils';
import type {IObservable, BatchFunction} from '~/types';

/* HELPERS */

const flush = <T> ( value: T, observable: IObservable<T> ): T => observable.write ( value );

/* MAIN */

function batch <T> ( fn: BatchFunction<T> ): T;
function batch <T> ( fn: T ): T;
function batch <T> ( fn: BatchFunction<T> | T ) {

  if ( isFunction ( fn ) ) {

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

  } else {

    return fn;

  }

};

/* MAIN */

export default batch;
