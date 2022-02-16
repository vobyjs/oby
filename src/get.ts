
/* IMPORT */

import is from './is';
import {ObservableCallableWithoutInitial, ObservableCallable, ReadonlyObservableCallableWithoutInitial, ReadonlyObservableCallable} from './types';

/* MAIN */

const get = <T> ( value: ObservableCallableWithoutInitial<T> | ObservableCallable<T> | ReadonlyObservableCallableWithoutInitial<T> | ReadonlyObservableCallable<T> | T ): T => {

  return ( is ( value ) ? value () : value ) as T; //TSC

};

/* EXPORT */

export default get;
