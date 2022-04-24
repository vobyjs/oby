
/* IMPORT */

import computed from '~/methods/computed';
import error from '~/methods/error';
import resolve from '~/methods/resolve';
import Observable from '~/objects/observable';
import {castError} from '~/utils';
import type {ErrorBoundaryFallbackFunction, ObservableReadonly, Resolved} from '~/types';

/* MAIN */

const errorBoundary = <T, F> ( fallback: ErrorBoundaryFallbackFunction<F>, value: T ): ObservableReadonly<Resolved<T | F>> => {

  const observable = new Observable<Error | null, Error | null> ( null );

  return computed ( () => {

    if ( observable.get () ) {

      const error = observable.sample ()!;
      const reset = () => observable.set ( null );
      const options = { error, reset };

      return resolve ( fallback ( options ) );

    } else {

      error ( error => {

        observable.set ( castError ( error ) );

      });

      return resolve ( value );

    }

  });

};

/* EXPORT */

export default errorBoundary;
