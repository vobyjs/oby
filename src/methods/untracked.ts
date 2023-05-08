
/* IMPORT */

import untrack from '~/methods/untrack';
import {SYMBOL_UNTRACKED} from '~/symbols';
import {isFunction} from '~/utils';
import type {UntrackedFunction} from '~/types';

/* MAIN */

function untracked <Arguments extends unknown[], T> ( fn: UntrackedFunction<Arguments, T> ): (( ...args: Arguments ) => T);
function untracked <T> ( fn: T ): (() => T);
function untracked <Arguments extends unknown[], T> ( fn: UntrackedFunction<Arguments, T> | T ) {

  const untracked = isFunction ( fn ) ? ( ...args: Arguments ): T => untrack ( () => fn ( ...args ) ) : () => fn;

  untracked[SYMBOL_UNTRACKED] = true;

  return untracked;

}

/* EXPORT */

export default untracked;
