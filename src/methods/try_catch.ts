
/* IMPORT */

import computed from '~/methods/computed';
import error from '~/methods/error';
import resolve from '~/methods/resolve';
import Observable from '~/objects/observable';
import {castError} from '~/utils';
import type {TryCatchFunction, ObservableReadonly, Resolved} from '~/types';

/* MAIN */

const tryCatch = <T, F> ( value: T, catchFn: TryCatchFunction<F> ): ObservableReadonly<Resolved<T | F>> => {

  const observable = new Observable<Error | null, Error | null> ( null );

  return computed ( () => {

    if ( observable.get () ) {

      const error = observable.sample ()!;
      const reset = () => observable.set ( null );
      const options = { error, reset };

      return resolve ( catchFn ( options ) );

    } else {

      error ( error => {

        observable.set ( castError ( error ) );

      });

      return resolve ( value );

    }

  });

};

/* EXPORT */

export default tryCatch;
