
/* IMPORT */

import {SYMBOL} from './constants';
import {isFunction} from './utils';
import {ObservableCallableWithoutInitial, ObservableCallable, ReadonlyObservableCallableWithoutInitial, ReadonlyObservableCallable} from './types';

/* MAIN */

const is = ( value: unknown ): value is ObservableCallableWithoutInitial | ObservableCallable | ReadonlyObservableCallableWithoutInitial | ReadonlyObservableCallable => {

  return isFunction ( value ) && !!value[SYMBOL];

};

/* EXPORT */

export default is;
