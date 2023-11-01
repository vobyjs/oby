
/* IMPORT */

import {SYMBOL_OBSERVABLE_BOOLEAN} from '~/symbols';
import {isFunction} from '~/utils';
import type {ObservableReadonly} from '~/types';

/* MAIN */

const isObservableBoolean = ( value: unknown ): value is ObservableReadonly<boolean> => {

  return isFunction ( value ) && ( SYMBOL_OBSERVABLE_BOOLEAN in value );

};

/* EXPORT */

export default isObservableBoolean;
