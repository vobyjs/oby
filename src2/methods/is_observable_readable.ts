
/* IMPORT */

import {FLAG_OBSERVABLE_TYPE_READABLE, MASK_OBSERVABLE_TYPE} from '../constants';
import {SYMBOL_OBSERVABLE} from '../symbols';
import {isFunction} from '../utils';
import type {ObservableReadonly} from '../types';

/* MAIN */

const isObservableReadable = <T = unknown> ( value: unknown ): value is ObservableReadonly<T> => {

  return isFunction ( value ) && ( ( value[SYMBOL_OBSERVABLE] || 0 ) & MASK_OBSERVABLE_TYPE ) === FLAG_OBSERVABLE_TYPE_READABLE;

};

/* EXPORT */

export default isObservableReadable;
