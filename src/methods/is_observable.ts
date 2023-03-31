
/* IMPORT */

import {SYMBOL_OBSERVABLE} from '~/symbols';
import {isFunction} from '~/utils';
import type {Observable, ObservableReadonly} from '~/types';

/* MAIN */

const isObservable = <T = unknown> ( value: unknown ): value is Observable<T> | ObservableReadonly<T> => {

  return isFunction ( value ) && ( SYMBOL_OBSERVABLE in value );

};

/* EXPORT */

export default isObservable;
