
/* IMPORT */

import {SYMBOL_OBSERVABLE_WRITABLE} from '~/constants';
import isObservable from '~/methods/is_observable';
import type {Observable} from '~/types';

/* MAIN */

const isObservableWritable = <T = unknown> ( value: unknown ): value is Observable<T> => {

  return isObservable ( value ) && ( SYMBOL_OBSERVABLE_WRITABLE in value );

};

/* EXPORT */

export default isObservableWritable;
