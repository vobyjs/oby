
/* IMPORT */

import {DIRTY_YES} from '~/constants';
import type {IObserver} from '~/types';

/* MAIN */

// This ensures that there's only one flushing of the queue happening at the same time

class Scheduler {

  /* VARIABLES */

  running?: Set<IObserver> = new Set ();
  waiting: Set<IObserver> = new Set ();

  counter: number = 0;
  locked: boolean = false;

  /* API */

  flush = (): void => {

    if ( this.locked ) return;

    if ( this.counter ) return;

    if ( !this.waiting.size ) return;

    try {

      this.locked = true;

      while ( this.waiting.size ) {

        this.running = this.waiting;
        this.waiting = new Set ();

        const current = this.running;

        for ( const observer of current ) {

          current?.delete ( observer );

          observer.stale ( DIRTY_YES );

        }

        this.running = undefined;

      }

    } finally {

      this.locked = false;

    }

  }

  push = ( observer: IObserver ): void => {

    if ( this.running?.has ( observer ) ) return;

    this.waiting.add ( observer );

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
