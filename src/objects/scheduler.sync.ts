
/* IMPORT */

import {DIRTY_YES} from '~/constants';
import type {IObserver} from '~/types';

/* MAIN */

// This ensures that there's only one flushing of the queue happening at the same time

class Scheduler {

  /* VARIABLES */

  running?: IObserver[] = [];
  waiting: IObserver[] = [];

  counter: number = 0;
  locked: boolean = false;

  /* API */

  flush = (): void => {

    if ( this.locked ) return;

    if ( this.counter ) return;

    if ( !this.waiting.length ) return;

    try {

      this.locked = true;

      while ( this.waiting.length ) {

        this.running = this.waiting;
        this.waiting = [];

        this.running.forEach ( observer => observer.stale ( DIRTY_YES ) );

        this.running = undefined;

      }

    } finally {

      this.locked = false;

    }

  }

  push = ( observer: IObserver ): void => {

    this.waiting.push ( observer );

  }

  wrap = ( fn: () => void ): void => {

    this.counter += 1;

    fn ();

    this.counter -= 1;

    this.flush ();

  }

}

/* EXPORT */

export default new Scheduler ();
