
/* IMPORT */

import {TRACKING} from '~/constants';
import {isFunction} from '~/utils';
import type {UntrackFunction} from '~/types';

/* MAIN */

function untrack <T> ( fn: UntrackFunction<T> ): T;
function untrack <T> ( fn: T ): T;
function untrack <T> ( fn: UntrackFunction<T> | T ) {

  if ( isFunction ( fn ) ) {

    if ( !TRACKING.current ) { // Already untracking

      return fn ();

    } else { // Starting untracking

      TRACKING.current = false;

      try {

        return fn ();

      } finally {

        TRACKING.current = true;

      }

    }

  } else {

    return fn;

  }

};

/* EXPORT */

export default untrack;
