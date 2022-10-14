
/* IMPORT */

import {SYMBOL_OBSERVABLE_FROZEN} from '~/constants';
import isObservable from '~/methods/is_observable';
import type {ObservableReadonly} from '~/types';

/* MAIN */

const isObservableFrozen = <T = unknown> ( value: unknown ): value is ObservableReadonly<T> => {

  return isObservable ( value ) && ( SYMBOL_OBSERVABLE_FROZEN in value );

};

/* EXPORT */

export default isObservableFrozen;
