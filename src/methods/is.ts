
/* IMPORT */

import {SYMBOL} from '~/constants';
import {isFunction} from '~/utils';
import type {Observable, ObservableReadonly} from '~/types';

/* MAIN */

const is = <T = unknown> ( value: unknown ): value is Observable<T> | ObservableReadonly<T> => {

  return isFunction ( value ) && ( SYMBOL in value );

};

/* EXPORT */

export default is;
