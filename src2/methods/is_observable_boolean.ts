
/* IMPORT */

import {FLAG_OBSERVABLE_BOOLEAN} from '../constants';
import {SYMBOL_OBSERVABLE} from '../symbols';
import {isFunction} from '../utils';
import type {Observable} from '../types';

/* MAIN */

const isObservableBoolean = <T = unknown> ( value: unknown ): value is Observable<T> => {

  return isFunction ( value ) && !!( ( value[SYMBOL_OBSERVABLE] || 0 ) & FLAG_OBSERVABLE_BOOLEAN );

};

/* EXPORT */

export default isObservableBoolean;
