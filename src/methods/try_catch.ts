
/* IMPORT */

import error from '~/methods/error';
import memo from '~/methods/memo';
import resolve from '~/methods/resolve';
import Observable from '~/objects/observable';
import {castError} from '~/utils';
import type {TryCatchFunction, ObservableReadonly, Resolved} from '~/types';

/* MAIN */

const tryCatch = <T, F> ( value: T, fn: TryCatchFunction<F> ): ObservableReadonly<Resolved<T | F>> => {

  const observable = new Observable<Error | undefined> ( undefined );

  return memo ( () => {

    if ( observable.read () ) {

      const error = observable.value!;
      const reset = () => observable.write ( undefined );
      const options = { error, reset };

      return resolve ( fn ( options ) );

    } else {

      error ( error => {

        observable.write ( castError ( error ) );

      });

      return resolve ( value );

    }

  });

};

/* EXPORT */

export default tryCatch;
