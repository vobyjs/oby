
/* IMPORT */

import {isArray, isFunction} from '~/utils';
import type {Resolvable, Resolved} from '~/types';

/* MAIN */

const resolve = <T> ( value: Resolvable<T> ): Resolved<T> => {

  while ( isFunction ( value ) ) {

    value = value ();

  }

  if ( isArray ( value ) ) {

    return value.map ( resolve );

  } else {

    return value;

  }

};

/* EXPORT */

export default resolve;
