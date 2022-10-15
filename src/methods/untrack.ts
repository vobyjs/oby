
/* IMPORT */

import {OWNER} from '~/constants';
import {isFunction} from '~/utils';
import type {UntrackFunction} from '~/types';

/* MAIN */

function untrack <T> ( fn: UntrackFunction<T> ): T;
function untrack <T> ( fn: T ): T;
function untrack <T> ( fn: UntrackFunction<T> | T ) {

  if ( isFunction ( fn ) ) {

    return OWNER.current.wrap ( fn, false );

  } else {

    return fn;

  }

}

/* EXPORT */

export default untrack;
