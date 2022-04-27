
/* IMPORT */

import {SYMBOL} from '~/constants';
import {isFunction} from '~/utils';
import type {ObservableAny} from '~/types';

/* MAIN */

const is = <T = unknown> ( value: unknown ): value is ObservableAny<T> => {

  return isFunction ( value ) && !!( value as any )[SYMBOL]; //TSC

};

/* EXPORT */

export default is;
