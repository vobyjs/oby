
/* IMPORT */

import boolean2 from '~/methods/boolean2';
import _switch from '~/methods/switch';
import type {ObservableReadonly, FunctionMaybe, Resolved} from '~/types';

/* MAIN */

const ternary = <T, F> ( when: FunctionMaybe<unknown>, valueTrue: T, valueFalse: F ): ObservableReadonly<Resolved<T | F>> => {

  const condition = boolean2 ( when );

  return _switch<boolean, T | F> ( condition, [[true, valueTrue], [valueFalse]] );

};

/* EXPORT */

export default ternary;
