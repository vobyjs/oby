
/* IMPORT */

import {isArray, isFunction} from '~/utils';

/* MAIN */

const resolve = <T> ( value: T ): any => { //FIXME: Type instantiation is excessively deep and possibly infinite. ts(2589)

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
