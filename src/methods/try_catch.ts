
/* IMPORT */

import {OWNER} from '~/context';
import memo from '~/methods/memo';
import $ from '~/methods/observable';
import resolve from '~/methods/resolve';
import type {TryCatchFunction, ObservableReadonly, Resolved} from '~/types';

/* MAIN */

const tryCatch = <T, F> ( value: T, fn: TryCatchFunction<F> ): ObservableReadonly<Resolved<T | F>> => {

  const observable = $<Error>();

  return memo ( () => {

    const error = observable ();

    if ( error ) {

      const reset = () => observable ( undefined );
      const options = { error, reset };

      return resolve ( fn ( options ) );

    } else {

      OWNER.errorHandler = observable;

      return resolve ( value );

    }

  });

};

/* EXPORT */

export default tryCatch;
