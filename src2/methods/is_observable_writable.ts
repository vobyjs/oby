
/* IMPORT */

import {FLAG_OBSERVABLE_TYPE_WRITABLE, MASK_OBSERVABLE_TYPE} from '../constants';
import {SYMBOL_OBSERVABLE} from '../symbols';
import {isFunction} from '../utils';
import type {Observable} from '../types';

/* MAIN */

const isObservableWritable = <T = unknown> ( value: unknown ): value is Observable<T> => {

  return isFunction ( value ) && ( ( value[SYMBOL_OBSERVABLE] || 0 ) & MASK_OBSERVABLE_TYPE ) === FLAG_OBSERVABLE_TYPE_WRITABLE;

};

/* EXPORT */

export default isObservableWritable;
