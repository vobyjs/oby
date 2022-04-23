
/* IMPORT */

import Observable from '~/objects/observable';
import computed from '~/methods/computed';
import error from '~/methods/error';
import resolve from '~/methods/resolve';
import {castError} from '~/utils';
import type {DisposeFunction, ObservableReadonly, Resolved} from '~/types';

/* MAIN */

const ErrorBoundary = <T, F> ( fallback: (({ error, reset }: { error: Error, reset: DisposeFunction }) => F), value: (() => T) ): ObservableReadonly<Resolved<T | F>> => {

  const observable = new Observable<Error | null, Error | null> ( null );

  return computed ( () => {

    if ( observable.get () ) {

      const error = observable.get ()!;
      const reset = () => observable.set ( null );
      const props = { error, reset };

      const res = resolve ( fallback ( props ) );

      return res;


    } else {

      error ( error => {

        observable.set ( castError ( error ) );

      });

      return resolve ( value );

    }

  });

};

/* EXPORT */

export default ErrorBoundary;
