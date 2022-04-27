
/* IMPORT */

import {SYMBOL} from '~/constants';
import {isFunction} from '~/utils';
import type {ObservableAny} from '~/types';

/* MAIN */

const is = <T = unknown> ( value: unknown ): value is ObservableAny<T> => {

  return isFunction ( value ) && ( SYMBOL in value );

};

/* EXPORT */

export default is;
