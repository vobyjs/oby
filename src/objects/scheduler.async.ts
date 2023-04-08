
/* IMPORT */

import {BATCH} from '~/context';
import type {IEffect} from '~/types';

/* MAIN */

// Using 2 microtasks to give a chance to things using 1 microtask (like refs in Voby) to run first

class Scheduler {

  /* VARIABLES */

  running?: Set<IEffect> = new Set ();
  waiting: Set<IEffect> = new Set ();

  locked: boolean = false;
  queued: boolean = false;

  /* QUEUING API */

  flush = (): void => {

    if ( this.locked ) return;

    if ( !this.waiting.size ) return;

    try {

      this.locked = true;

      while ( this.waiting.size ) {

        this.running = this.waiting;
        this.waiting = new Set ();

        for ( const effect of this.running ) {

          effect.update ();

        }

        this.running = undefined;

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

    this.waiting.add ( effect );

    this.queue ();

  }

}

/* EXPORT */

export default new Scheduler ();
