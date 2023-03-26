
//TODO: retwite this

/* IMPORT */

import {BATCH, setBatch} from '~/context';
import {noop} from '~/utils';
import type {BatchFunction} from '~/types';

/* HELPERS */

let resolve: () => void = noop;
let count: number = 0;

const makeNakedPromise = (): [Promise<void>, () => void] => {
  let resolve = noop;
  const promise = new Promise<void> ( res => {
    resolve = res;
  });
  return [promise, resolve];
};

/* MAIN */

const batch = async <T> ( fn: BatchFunction<T> ): Promise<Awaited<T>> => {

  if ( !BATCH ) {

    const [p, r] = makeNakedPromise ();

    setBatch ( p );
    resolve = r;

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

//TODO: REVIEW
