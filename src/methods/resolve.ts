
/* IMPORT */

import memo from '~/methods/memo';
import {frozen} from '~/objects/callable';
import {SYMBOL_OBSERVABLE, SYMBOL_UNTRACKED, SYMBOL_UNTRACKED_UNWRAPPED} from '~/symbols';
import {isFunction} from '~/utils';
import type {Resolvable, Resolved} from '../types';

/* MAIN */

//TODO: This function is pretty ugly, maybe it can be written better?

function resolve <T> ( value: T ): T extends Resolvable ? Resolved<T> : never;
function resolve <T> ( value: T ): any { //TSC

  if ( isFunction ( value ) ) {

    if ( SYMBOL_UNTRACKED_UNWRAPPED in value ) {

      return resolve ( value () );

    } else if ( SYMBOL_UNTRACKED in value ) {

      return frozen ( resolve ( value () ) );

    } else if ( SYMBOL_OBSERVABLE in value ) {

      return value;

    } else {

      return memo ( () => resolve ( value () ) );

    }

  }

  if ( value instanceof Array ) {

    const resolved = new Array ( value.length );

    for ( let i = 0, l = resolved.length; i < l; i++ ) {

      resolved[i] = resolve ( value[i] );

    }

    return resolved;

  } else {

    return value;

  }

}

/* EXPORT */

export default resolve;
