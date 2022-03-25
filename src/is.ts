
/* IMPORT */

import {SYMBOL} from './constants';
import {ObservableAny} from './types';

/* MAIN */

const is = ( value: unknown ): value is ObservableAny => {

  return ( typeof value === 'function' ) && !!value[SYMBOL];

};

/* EXPORT */

export default is;
