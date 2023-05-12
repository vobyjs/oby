
/* IMPORT */

import type {IObserver} from '~/types';

/* MAIN */

// This ensures that there's only one flushing of the queue happening at the same time

class Scheduler {

  /* VARIABLES */

  waiting: IObserver[] = [];

  counter: number = 0;
  locked: boolean = false;

  /* QUEING API */

  flush = (): void => {

    if ( this.locked ) return;

    if ( this.counter ) return;

    if ( !this.waiting.length ) return;

    try {

      this.locked = true;

      while ( true ) {

        const queue = this.waiting;

        if ( !queue.length ) break;

        this.waiting = [];

        for ( let i = 0, l = queue.length; i < l; i++ ) {

          queue[i].update ();

        }

      }

    } finally {

      this.locked = false;

    }

  }

  wrap = ( fn: () => void ): void => {

    this.counter += 1;

    fn ();

    this.counter -= 1;

    this.flush ();

  }

  /* SCHEDULING API */

  schedule = ( observer: IObserver ): void => {

    this.waiting.push ( observer );

  }

}

/* EXPORT */

export default new Scheduler ();
