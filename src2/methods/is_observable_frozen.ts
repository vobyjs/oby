
/* IMPORT */

import {FLAG_OBSERVABLE_TYPE_FROZEN, MASK_OBSERVABLE_TYPE} from '../constants';
import {SYMBOL_OBSERVABLE} from '../symbols';
import {isFunction} from '../utils';
import type {ObservableReadonly} from '../types';

/* MAIN */

const isObservableFrozen = <T = unknown> ( value: unknown ): value is ObservableReadonly<T> => {

  return isFunction ( value ) && ( ( value[SYMBOL_OBSERVABLE] || 0 ) & MASK_OBSERVABLE_TYPE ) === FLAG_OBSERVABLE_TYPE_FROZEN;

};

/* EXPORT */

export default isObservableFrozen;
