
/* IMPORT */

import {SYMBOL_STORE} from '~/constants';
import {isObject} from '~/utils';

/* MAIN */

const isStore = ( value: unknown ): boolean => {

  return isObject ( value ) && ( SYMBOL_STORE in value );

};

/* EXPORT */

export default isStore;
