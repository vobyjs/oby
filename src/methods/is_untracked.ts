
/* IMPORT */

import {SYMBOL_UNTRACKED, SYMBOL_UNTRACKED_UNWRAPPED} from '~/symbols';
import {isFunction} from '~/utils';

/* MAIN */

const isUntracked = ( value: unknown ): boolean => {

  return isFunction ( value ) && ( ( SYMBOL_UNTRACKED in value ) || ( SYMBOL_UNTRACKED_UNWRAPPED in value ) );

};

/* EXPORT */

export default isUntracked;
