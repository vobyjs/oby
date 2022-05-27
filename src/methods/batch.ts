
/* IMPORT */

import {BATCH} from '~/constants';
import {isFunction} from '~/utils';
import type {IObservable, BatchFunction} from '~/types';

/* HELPERS */

const flush = <T> ( value: T, observable: IObservable<T> ): T => observable.write ( value );
const stale = <T> ( value: T, observable: IObservable<T> ): void => observable.stale ( false );
const unstale = <T> ( value: T, observable: IObservable<T> ): void => observable.unstale ( false );

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

        if ( batch.size > 1 ) {

          batch.forEach ( stale );

        }

        try {

          batch.forEach ( flush );

        } finally {

          if ( batch.size > 1 ) {

            batch.forEach ( unstale );

          }

        }

      }

    }

  } else {

    return fn;

  }

};

/* MAIN */

export default batch;
