
/* IMPORT */

import Observable from './observable';
import {BatchFunction} from './types';

/* MAIN */

class Batch {

  /* VARIABLES */

  public active: boolean;
  private level = 0;
  private queue?: Map<Observable, unknown>;

  /* REGISTRATION API */

  registerSet = ( observable: Observable, value: unknown ): void => {

    if ( !this.queue ) return;

    this.queue.set ( observable, value );

  };

  /* WRAPPING API */

  wrap = ( fn: BatchFunction ): void => {

    const queuePrev = this.queue;
    const queueNext = queuePrev || new Map ();

    this.level += 1;
    this.queue = queueNext;
    this.active = true;

    try {

      fn ();

    } finally {

      this.level -= 1;
      this.queue = queuePrev;
      this.active = !!this.level;

      if ( !this.active ) {

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
