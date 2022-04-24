
/* IMPORT */

import {SAMPLING} from '~/constants';
import type {SampleFunction} from '~/types';

/* MAIN */

const sample = <T> ( fn: SampleFunction<T> ): T => {

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

};

/* EXPORT */

export default sample;
