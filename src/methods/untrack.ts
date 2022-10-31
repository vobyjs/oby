
/* IMPORT */

import {TRACKING} from '~/constants';
import {isFunction} from '~/utils';
import type {UntrackFunction} from '~/types';

/* MAIN */

function untrack <T> ( fn: UntrackFunction<T> ): T;
function untrack <T> ( fn: T ): T;
function untrack <T> ( fn: UntrackFunction<T> | T ) {

  if ( isFunction ( fn ) ) {

    const trackingPrev = TRACKING.current;

    try {

      TRACKING.current = false;

      return fn ();

    } finally {

      TRACKING.current = trackingPrev;

    }

  } else {

    return fn;

  }

}

/* EXPORT */

export default untrack;
