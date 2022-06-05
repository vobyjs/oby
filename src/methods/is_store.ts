
/* IMPORT */

import {SYMBOL_STORE} from '~/constants';
import {isObject} from '~/utils';

/* MAIN */

const isStore = ( value: unknown ): boolean => {

  return isObject ( value ) && !!value[SYMBOL_STORE];

};

/* EXPORT */

export default isStore;
