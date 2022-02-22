
/* IMPORT */

import is from './is';
import {ObservableResolved} from './types';

/* MAIN */

const get = <T> ( value: T ): ObservableResolved<T> => {

  if ( is ( value ) ) return get ( value () as any ); //TSC

  return value as any; //TSC

};

/* EXPORT */

export default get;
