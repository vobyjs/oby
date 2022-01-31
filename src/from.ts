
/* IMPORT */

import Effect from './effect';
import Obserable from './observable';
import {FromFunction, ObservableCallableWithoutInitial, ObservableOptions} from './types';

/* MAIN */

const from = <T> ( fn: FromFunction<T>, options?: ObservableOptions<T, T | undefined> ): ObservableCallableWithoutInitial<T> => {

  const observable = Obserable.wrap<T> ( undefined, options );

  Effect.wrap ( () => fn ( observable ) );

  return observable;

};

/* EXPORT */

export default from;
