
/* IMPORT */

import {SYMBOL} from './constants';
import {isFunction} from './utils';
import {ObservableCallableWithoutInitial, ObservableCallable} from './types';

/* MAIN */

const is = ( value: unknown ): value is ObservableCallableWithoutInitial | ObservableCallable => {

  return isFunction ( value ) && !!value[SYMBOL];

};

/* EXPORT */

export default is;
