
/* IMPORT */

import is from './is';
import {ObservableCallableWithoutInitial, ObservableCallable, ReadonlyObservableCallableWithoutInitial, ReadonlyObservableCallable} from './types';

/* MAIN */

const get = <T> ( value: ObservableCallableWithoutInitial<T> | ObservableCallable<T> | ReadonlyObservableCallableWithoutInitial<T> | ReadonlyObservableCallable<T> | T ): T => {

  if ( is ( value ) ) return get ( value () as T ); //TSC

  return value;

};

/* EXPORT */

export default get;
