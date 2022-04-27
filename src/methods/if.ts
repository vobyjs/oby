
/* IMPORT */

import ternary from '~/methods/ternary';
import type {ObservableReadonly, FunctionMaybe, Resolved} from '~/types';

/* MAIN */

const _if = <T, F> ( when: FunctionMaybe<unknown>, value: T, fallback?: T ): ObservableReadonly<Resolved<T | F | undefined>> => {

  return ternary ( when, value, fallback );

};

/* EXPORT */

export default _if;
