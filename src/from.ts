
/* IMPORT */

import Effect from './effect';
import Observable from './observable';
import readable from './readable';
import writable from './writable';
import {FromFunction, ObservableReadonlyWithoutInitial, ObservableOptions} from './types';

/* MAIN */

const from = <T> ( fn: FromFunction<T>, options?: ObservableOptions<T, T | undefined> ): ObservableReadonlyWithoutInitial<T> => {

  const observable = new Observable<T | undefined> ( undefined, options );
  const value = writable ( observable );

  Effect.wrap ( () => {

    return fn ( value );

  });

  return readable ( observable );

};

/* EXPORT */

export default from;
