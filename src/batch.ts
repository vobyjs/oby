
/* IMPORT */

import Observable from './observable';
import {BatchFunction} from './types';

/* MAIN */

class Batch {

  /* VARIABLES */

  private level = 0;
  private queue?: Map<Observable, unknown>;

  /* REGISTRATION API */

  registerSet = ( observable: Observable, value: unknown ): boolean => {

    if ( !this.queue ) return false;

    this.queue.set ( observable, value );

    return true;

  };

  /* WRAPPING API */

  wrap = ( fn: BatchFunction ): void => {

    const queuePrev = this.queue;
    const queueNext = queuePrev || new Map ();

    this.level += 1;
    this.queue = queueNext;

    try {

      fn ();

    } finally {

      this.level -= 1;
      this.queue = queuePrev;

      if ( !this.level ) {

        this.flush ( queueNext );

      }

    }

  };

  /* API */

  flush = ( queue: Map<Observable, unknown> ): void => {

    queue.forEach ( ( value, observable ) => observable.set ( value ) );

  };

}

/* EXPORT */

export default new Batch ();
