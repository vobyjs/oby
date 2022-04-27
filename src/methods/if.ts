
/* IMPORT */

import ternary from '~/methods/ternary';
import type {ObservableReadonly, FunctionMaybe, Resolved} from '~/types';

/* MAIN */

const _if = <T, F> ( when: FunctionMaybe<unknown>, valueTrue: T, valueFalse?: T ): ObservableReadonly<Resolved<T | F | undefined>> => {

  return ternary ( when, valueTrue, valueFalse );

};

/* EXPORT */

export default _if;
