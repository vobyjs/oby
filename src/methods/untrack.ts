
/* IMPORT */

import {OBSERVER, setObserver} from '~/context';
import {isFunction} from '~/utils';
import type {FunctionMaybe, UntrackFunction} from '~/types';

/* MAIN */

function untrack <T> ( fn: FunctionMaybe<T> ): T;
function untrack <T> ( fn: UntrackFunction<T> ): T;
function untrack <T> ( fn: T ): T;
function untrack <T> ( fn: UntrackFunction<T> | T ) {

  if ( isFunction ( fn ) ) {

    const observerPrev = OBSERVER;

    if ( observerPrev ) {

      try {

        setObserver ( undefined );

        return fn ();

      } finally {

        setObserver ( observerPrev );

      }

    } else {

      return fn ();

    }

  } else {

    return fn;

  }

}

/* EXPORT */

export default untrack;
