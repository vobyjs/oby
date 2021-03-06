
/* IMPORT */

import {SYMBOL_OBSERVABLE, SYMBOL_RESOLVE_UNWRAPPED, SYMBOL_SAMPLED} from '~/constants';
import computed from '~/methods/computed';
import {frozen} from '~/objects/callable';
import {isFunction} from '~/utils';
import type {Resolvable, Resolved} from '../types';

/* MAIN */

//TODO: This function is really ugly, maybe it can be written decently?

const resolve = <T> ( value: T ): T extends Resolvable ? Resolved<T> : never => {

  if ( isFunction ( value ) ) {

    if ( SYMBOL_SAMPLED in value ) {

      if ( SYMBOL_RESOLVE_UNWRAPPED in value ) {

        return resolve ( value () ) as any; //TSC

      } else {

        return frozen ( resolve ( value () ) ) as any; //TSC

      }

    } else if ( SYMBOL_OBSERVABLE in value ) {

      return value as any; //TSC

    } else {

      return computed ( () => resolve ( value () ) ) as any; //TSC

    }

  }

  if ( value instanceof Array ) {

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
