
/* IMPORT */

import {isArray, isFunction} from '~/utils';
import type {Resolved} from '~/types';

/* MAIN */

const resolve = <T> ( value: T ): Resolved<T> => {

  let resolved: any = value; //TSC

  while ( isFunction ( resolved ) ) {

    resolved = resolved ();

  }

  if ( isArray ( resolved ) ) {

    return resolved.map ( resolve ) as Resolved<T>; //TSC

  } else {

    return resolved as Resolved<T>; //TSC

  }

};

/* EXPORT */

export default resolve;
