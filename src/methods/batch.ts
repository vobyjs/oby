
/* IMPORT */

import {BATCH, setBatch} from '~/context';
import {noop} from '~/utils';
import type {BatchFunction, CallbackFunction} from '~/types';

/* HELPERS */

let count: number = 0;
let resolve: CallbackFunction = noop;

/* MAIN */

const batch = async <T> ( fn: BatchFunction<T> ): Promise<Awaited<T>> => {

  if ( !BATCH ) {

    setBatch ( new Promise ( r => resolve = r ) );

  }

  try {

    count += 1;

    return await fn ();

  } finally {

    count -= 1;

    if ( !count ) {

      setBatch ( undefined );
      resolve ();

    }

  }

};

/* MAIN */

export default batch;
