
/* IMPORT */

import {SYMBOL} from './constants';
import {isFunction} from './utils';
import {ObservableAny} from './types';

/* MAIN */

const is = ( value: unknown ): value is ObservableAny => {

  return isFunction ( value ) && !!value[SYMBOL];

};

/* EXPORT */

export default is;
