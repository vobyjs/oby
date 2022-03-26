
/* IMPORT */

import is from './is';
import {ObservableResolved} from './types';

/* MAIN */

const get = <T> ( value: T ): ObservableResolved<T> => {

  if ( is<ObservableResolved<T>> ( value ) ) return value () as ObservableResolved<T>; //TSC

  return value as any; //TSC

};

/* EXPORT */

export default get;
