
/* IMPORT */

import {OBSERVER_DISPOSED} from '~/constants';
import {SYMBOL_OBSERVABLE_FROZEN, SYMBOL_OBSERVABLE_READABLE} from '~/symbols';
import {isFunction} from '~/utils';
import type {ObservableReadonly} from '~/types';

/* MAIN */

const isObservableFrozen = <T = unknown> ( value: unknown ): value is ObservableReadonly<T> => {

  return isFunction ( value ) && ( ( SYMBOL_OBSERVABLE_FROZEN in value ) || ( value[SYMBOL_OBSERVABLE_READABLE]?.parent === OBSERVER_DISPOSED ) );

};

/* EXPORT */

export default isObservableFrozen;
