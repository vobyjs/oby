
/* IMPORT */

import {SYMBOL_OBSERVABLE_FROZEN, SYMBOL_OBSERVABLE_READABLE, SYMBOL_OBSERVABLE_WRITABLE} from '~/constants';
import {isFunction} from '~/utils';
import type {Observable, ObservableReadonly} from '~/types';

/* MAIN */

const isObservable = <T = unknown> ( value: unknown ): value is Observable<T> | ObservableReadonly<T> => {

  return isFunction ( value ) && ( ( SYMBOL_OBSERVABLE_FROZEN in value ) || ( SYMBOL_OBSERVABLE_READABLE in value ) || ( SYMBOL_OBSERVABLE_WRITABLE in value ) );

};

/* EXPORT */

export default isObservable;
