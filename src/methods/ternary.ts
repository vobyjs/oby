
/* IMPORT */

import computed from '~/methods/computed';
import resolve from '~/methods/resolve';
import type {ObservableReadonly, FunctionMaybe, Resolved} from '~/types';

/* MAIN */

const ternary = <T, F> ( when: FunctionMaybe<unknown>, valueTrue: T, valueFalse: F ): ObservableReadonly<Resolved<T | F>> => {

  const value = computed ( () => {

    if ( resolve ( when ) ) return valueTrue;

    return valueFalse;

  });

  return computed ( () => {

    return resolve ( value );

  });

};

/* EXPORT */

export default ternary;
