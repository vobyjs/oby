
/* IMPORT */

import type {Resolvable, Resolved} from '~/types';

/* MAIN */

const resolve = <T> ( value: Resolvable<T> ): Resolved<T> => {

  while ( typeof value === 'function' ) {

    value = ( value as Function )(); //TSC

  }

  if ( Array.isArray ( value ) ) {

    return value.map ( resolve );

  } else {

    return value;

  }

};

/* EXPORT */

export default resolve;
