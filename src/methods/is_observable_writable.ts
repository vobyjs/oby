
/* IMPORT */

import {SYMBOL_OBSERVABLE_WRITABLE} from '~/symbols';
import {isFunction} from '~/utils';
import type {Observable} from '~/types';

/* MAIN */

const isObservableWritable = <T = unknown> ( value: unknown ): value is Observable<T> => {

  return isFunction ( value ) && ( SYMBOL_OBSERVABLE_WRITABLE in value );

};

/* EXPORT */

export default isObservableWritable;
