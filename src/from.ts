
/* IMPORT */

import observable from '.';
import Effect from './effect';
import {FromFunction, ObservableCallableWithoutInitial, ObservableOptions} from './types';

/* MAIN */

const from = <T> ( fn: FromFunction<T>, options?: ObservableOptions<T, T | undefined> ): ObservableCallableWithoutInitial<T> => {

  const value = observable<T> ( undefined, options );

  Effect.wrap ( () => fn ( value ) );

  return value;

};

/* EXPORT */

export default from;
