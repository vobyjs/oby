
/* IMPORT */

import {OBSERVER, setObserver} from '~/context';
import {isFunction} from '~/utils';
import type {UntrackFunction} from '~/types';

/* MAIN */

function untrack <T> ( fn: UntrackFunction<T> ): T;
function untrack <T> ( fn: T ): T;
function untrack <T> ( fn: UntrackFunction<T> | T ) {

  if ( isFunction ( fn ) ) {

    const trackingPrev = OBSERVER;

    try {

      setObserver ( undefined );

      return fn ();

    } finally {

      setObserver ( trackingPrev );

    }

  } else {

    return fn;

  }

}

/* EXPORT */

export default untrack;
