
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

    return resolved.map ( resolve );

  } else {

    return resolved;

  }

};

/* EXPORT */

export default resolve;
