
/* IMPORT */

import untrack from '~/methods/untrack';
import {SYMBOL_UNTRACKED} from '~/symbols';
import type {UntrackFunction} from '~/types';

/* MAIN */

function untracked <T> ( fn: UntrackFunction<T> ): (() => T);
function untracked <T> ( fn: T ): (() => T);
function untracked <T> ( fn: UntrackFunction<T> | T ) {

  const untracked = () => untrack ( fn );

  untracked[SYMBOL_UNTRACKED] = true;

  return untracked;

}

/* EXPORT */

export default untracked;
