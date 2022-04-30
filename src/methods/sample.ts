
/* IMPORT */

import {SAMPLING} from '~/constants';
import {isFunction} from '~/utils';
import type {SampleFunction} from '~/types';

/* MAIN */

function sample <T> ( fn: SampleFunction<T> ): T;
function sample <T> ( fn: T ): T;
function sample <T> ( fn: SampleFunction<T> | T ) {

  if ( isFunction ( fn ) ) {

    if ( SAMPLING.current ) { // Already sampling

      return fn ();

    } else { // Starting sampling

      SAMPLING.current = true;

      try {

        return fn ();

      } finally {

        SAMPLING.current = false;

      }

    }

  } else {

    return fn;

  }

};

/* EXPORT */

export default sample;
