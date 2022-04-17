
/* IMPORT */

import {readable, writable} from './callable';
import Effect from './effect';
import Observable from './observable';
import type {FromFunction, ObservableReadonlyWithoutInitial, ObservableOptions} from './types';

/* MAIN */

const from = <T> ( fn: FromFunction<T>, options?: ObservableOptions<T, T | undefined> ): ObservableReadonlyWithoutInitial<T> => {

  const observable = Observable.create<T, T | undefined> ( undefined, options );
  const value = writable ( observable );

  Effect.create ( () => {

    return fn ( value );

  });

  return readable ( observable );

};

/* EXPORT */

export default from;
