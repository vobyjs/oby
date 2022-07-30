
/* IMPORT */

import {UNTRACKING} from '~/constants';
import {isFunction} from '~/utils';
import type {UntrackFunction} from '~/types';

/* MAIN */

function untrack <T> ( fn: UntrackFunction<T> ): T;
function untrack <T> ( fn: T ): T;
function untrack <T> ( fn: UntrackFunction<T> | T ) {

  if ( isFunction ( fn ) ) {

    if ( UNTRACKING.current ) { // Already untracking

      return fn ();

    } else { // Starting untracking

      UNTRACKING.current = true;

      try {

        return fn ();

      } finally {

        UNTRACKING.current = false;

      }

    }

  } else {

    return fn;

  }

};

/* EXPORT */

export default untrack;
