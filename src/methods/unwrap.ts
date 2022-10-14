
/* IMPORT */

import isObservableFrozen from '~/methods/is_observable_frozen';
import type {FunctionMaybe} from '~/types';

/* MAIN */

// This function removes the wrapper frozen observable, if any

const unwrap = <T> ( value: FunctionMaybe<T> ): FunctionMaybe<T> => {

  if ( isObservableFrozen<T> ( value ) ) {

    return value ();

  } else {

    return value;

  }

};

/* EXPORT */

export default unwrap;
