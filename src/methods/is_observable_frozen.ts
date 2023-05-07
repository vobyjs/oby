
/* IMPORT */

import {SYMBOL_OBSERVABLE_FROZEN, SYMBOL_OBSERVABLE_READABLE} from '~/symbols';
import {isFunction} from '~/utils';
import type {ObservableReadonly} from '~/types';

/* MAIN */

const isObservableFrozen = <T = unknown> ( value: unknown ): value is ObservableReadonly<T> => {

  return isFunction ( value ) && ( ( SYMBOL_OBSERVABLE_FROZEN in value ) || !!value[SYMBOL_OBSERVABLE_READABLE]?.parent?.disposed );

};

/* EXPORT */

export default isObservableFrozen;
