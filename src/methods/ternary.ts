
/* IMPORT */

import computed from '~/methods/computed';
import resolve from '~/methods/resolve';
import type {ObservableReadonly, FunctionMaybe, Resolved} from '~/types';

/* MAIN */

const ternary = <T, F> ( when: FunctionMaybe<boolean>, valueTrue: T, valueFalse: F ): ObservableReadonly<Resolved<T | F>> => {

  return computed ( () => {

    if ( resolve ( when ) ) return resolve ( valueTrue );

    return resolve ( valueFalse );

  });

};

/* EXPORT */

export default ternary;
