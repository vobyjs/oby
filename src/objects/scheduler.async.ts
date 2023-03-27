
/* IMPORT */

import {BATCH} from '~/context';
import type {IEffect} from '~/types';

/* MAIN */

// Using 2 microtasks to give a chance to things using 1 microtask (like refs in Voby) to run first

class Scheduler {

  /* VARIABLES */

  running?: Set<IEffect> = new Set ();
  waiting: Set<IEffect> = new Set ();
  queued: boolean = false;

  /* QUEUING API */

  flush = (): void => {

    if ( !this.waiting.size ) return;

    this.running = this.waiting;
    this.waiting = new Set ();

    for ( const effect of this.running ) {

      effect.update ();

    }

    this.running = undefined;

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

  unschedule = ( effect: IEffect ): void => {

    this.running?.delete ( effect );
    this.waiting.delete ( effect );

  }

}

/* EXPORT */

export default new Scheduler ();
