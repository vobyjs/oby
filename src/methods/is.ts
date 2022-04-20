
/* IMPORT */

import {SYMBOL} from '~/constants';
import type {ObservableAny} from '~/types';

/* MAIN */

const is = <T = unknown> ( value: unknown ): value is ObservableAny<T> => {

  return ( typeof value === 'function' ) && ( SYMBOL in value );

};

/* EXPORT */

export default is;
