
/* IMPORT */

import ternary from '~/methods/ternary';
import type {ObservableReadonly, FunctionMaybe, Resolved} from '~/types';

/* MAIN */

const _if = <T> ( when: FunctionMaybe<boolean>, value: T ): ObservableReadonly<Resolved<T | undefined>> => {

  return ternary ( when, value, undefined );

};

/* EXPORT */

export default _if;
