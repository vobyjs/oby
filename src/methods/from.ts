
/* IMPORT */

import effect from '~/methods/effect';
import Observable from '~/objects/observable';
import type {FromFunction, ObservableOptions, ObservableReadonlyWithoutInitial} from '~/types';

/* MAIN */

const from = <T> ( fn: FromFunction<T>, options?: ObservableOptions<T, T | undefined> ): ObservableReadonlyWithoutInitial<T> => {

  const observable = new Observable<T, T | undefined> ( undefined, options );
  const value = observable.writable ();

  effect ( () => {

    return fn ( value );

  });

  return observable.readable ();

};

/* EXPORT */

export default from;
