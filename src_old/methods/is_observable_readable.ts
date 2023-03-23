
/* IMPORT */

import {SYMBOL_OBSERVABLE_READABLE} from '~/symbols';
import {isFunction} from '~/utils';
import type {ObservableReadonly} from '~/types';

/* MAIN */

const isObservableReadable = <T = unknown> ( value: unknown ): value is ObservableReadonly<T> => {

  return isFunction ( value ) && ( SYMBOL_OBSERVABLE_READABLE in value );

};

/* EXPORT */

export default isObservableReadable;
