
/* IMPORT */

import is from '~/methods/is';
import type {ObservableResolved} from '~/types';

/* MAIN */

const get = <T> ( value: T ): ObservableResolved<T> => {

  if ( is<ObservableResolved<T>> ( value ) ) return value ();

  return value as ObservableResolved<T>; //TSC

};

/* EXPORT */

export default get;
