
/* IMPORT */

import computed from '~/methods/computed';
import _switch from '~/methods/switch';
import {isFunction} from '~/utils';
import type {ObservableReadonly, FunctionMaybe, Resolved} from '~/types';

/* MAIN */

const ternary = <T, F> ( when: FunctionMaybe<unknown>, valueTrue: T, valueFalse: F ): ObservableReadonly<Resolved<T | F>> => {

  const condition = computed ( () => isFunction ( when ) ? !!when () : !!when );

  return _switch<boolean, T | F> ( condition, [[true, valueTrue], [valueFalse]] );

};

/* EXPORT */

export default ternary;
