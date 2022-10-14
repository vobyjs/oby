
/* IMPORT */

import ternary from '~/methods/ternary';
import type {ObservableReadonly, FunctionMaybe, Resolved} from '~/types';

/* MAIN */

function _if <T> ( when: FunctionMaybe<unknown>, valueTrue: T, valueFalse?: undefined ): ObservableReadonly<Resolved<T | undefined>>;
function _if <T, F> ( when: FunctionMaybe<unknown>, valueTrue: T, valueFalse: F ): ObservableReadonly<Resolved<T | F>>;
function _if <T, F> ( when: FunctionMaybe<unknown>, valueTrue: T, valueFalse?: F ): ObservableReadonly<Resolved<T | F | undefined>> {

  return ternary ( when, valueTrue, valueFalse );

}

/* EXPORT */

export default _if;
