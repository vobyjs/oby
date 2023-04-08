
/* IMPORT */

import {BATCH} from '~/context';
import type {IEffect} from '~/types';

/* MAIN */

// Using 2 microtasks to give a chance to things using 1 microtask (like refs in Voby) to run first

class Scheduler {

  /* VARIABLES */

  waiting: IEffect[] = [];

  locked: boolean = false;
  queued: boolean = false;

  /* QUEUING API */

  flush = (): void => {

    if ( this.locked ) return;

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

  queue = (): void => {

    if ( this.queued ) return;

    this.queued = true;

    this.resolve ();

  }

  resolve = (): void => {

    queueMicrotask ( () => {

      queueMicrotask ( () => {

        if ( BATCH ) {

          BATCH.finally ( this.resolve );

        } else {

          this.queued = false;

          this.flush ();

        }

      });

    });

  }

  /* SCHEDULING API */

  schedule = ( effect: IEffect ): void => {

    this.waiting.push ( effect );

    this.queue ();

  }

}

/* EXPORT */

export default new Scheduler ();
