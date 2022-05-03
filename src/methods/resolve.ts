
/* IMPORT */

import {SYMBOL} from '~/constants';
import computed from '~/methods/computed';
import {isArray, isFunction} from '~/utils';
import type {Resolvable, Resolved} from '../types';

/* MAIN */

const resolve = <T> ( value: T ): T extends Resolvable ? Resolved<T> : never => {

  if ( isFunction ( value ) ) {

    if ( SYMBOL in value ) {

      return value as any; //TSC

    } else {

      return computed ( () => resolve ( value () ) ) as any; //TSC

    }

  }

  if ( isArray ( value ) ) {

    const resolved = new Array ( value.length );

    for ( let i = 0, l = resolved.length; i < l; i++ ) {

      resolved[i] = resolve ( value[i] );

    }

    return resolved as any; //TSC

  } else {

    return value as any; //TSC

  }

};

/* EXPORT */

export default resolve;
