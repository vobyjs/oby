
/* IMPORT */

import {setBatch} from '~/context';
import {noop} from '~/utils';
import type {BatchFunction, CallbackFunction} from '~/types';

/* HELPERS */

let counter: number = 0;
let resolve: CallbackFunction = noop;

/* MAIN */

const batch = async <T> ( fn: BatchFunction<T> ): Promise<Awaited<T>> => {

  if ( !counter ) {

    setBatch ( new Promise ( r => resolve = r ) );

  }

  try {

    counter += 1;

    return await fn ();

  } finally {

    counter -= 1;

    if ( !counter ) {

      setBatch ( undefined );
      resolve ();

    }

  }

};

/* MAIN */

export default batch;
