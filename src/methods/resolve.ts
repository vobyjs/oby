
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

    return value.map ( resolve ) as any; //TSC

  } else {

    return value as any; //TSC

  }

};

/* EXPORT */

export default resolve;
