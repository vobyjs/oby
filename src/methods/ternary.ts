
/* IMPORT */

import computed from '~/methods/computed';
import resolve from '~/methods/resolve';
import _switch from '~/methods/switch';
import type {ObservableReadonly, FunctionMaybe, Resolved} from '~/types';

/* MAIN */

const ternary = <T, F> ( when: FunctionMaybe<unknown>, valueTrue: T, valueFalse: F ): ObservableReadonly<Resolved<T | F>> => {

  const condition = computed ( () => !!resolve ( when ) );

  return _switch ( condition, [[true, valueTrue], [valueFalse]] );

};

/* EXPORT */

export default ternary;
