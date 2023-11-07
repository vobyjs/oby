
/* IMPORT */

import {isFunction} from '../utils';
import type {FunctionMaybe} from '../types';

/* MAIN */

const get = <T> ( value: FunctionMaybe<T> ): T => {

  if ( isFunction ( value ) ) {

    return value ();

  } else {

    return value;

  }

};

/* EXPORT */

export default get;
