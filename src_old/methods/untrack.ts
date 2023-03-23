
/* IMPORT */

import {TRACKING, setTracking} from '~/context';
import {isFunction} from '~/utils';
import type {UntrackFunction} from '~/types';

/* MAIN */

function untrack <T> ( fn: UntrackFunction<T> ): T;
function untrack <T> ( fn: T ): T;
function untrack <T> ( fn: UntrackFunction<T> | T ) {

  if ( isFunction ( fn ) ) {

    const trackingPrev = TRACKING;

    try {

      setTracking ( false );

      return fn ();

    } finally {

      setTracking ( trackingPrev );

    }

  } else {

    return fn;

  }

}

/* EXPORT */

export default untrack;
