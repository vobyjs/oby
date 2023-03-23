
/* IMPORT */

import type {IEffect} from '~/types';

/* MAIN */

class Scheduler {

  /* VARIABLES */

  queue: Set<IEffect>;
  running: Set<IEffect>;
  scheduled: boolean;

  /* CONSTRUCTOR */

  constructor () {

    this.queue = new Set ();
    this.running = new Set ();
    this.scheduled = false;

  }

  /* API */

  push ( effect: IEffect ): void {

    if ( this.running.has ( effect ) ) return;

    this.queue.add ( effect );

    this.schedule ();

  }

  pop ( effect: IEffect ): void {

    this.queue.delete ( effect );
    this.running.delete ( effect );

  }

  flush (): void {

    this.running = this.queue;
    this.queue = new Set ();

    this.running.forEach ( effect => effect.update () );

  }

  schedule (): void {

    if ( this.scheduled ) return;

    this.scheduled = true;

    queueMicrotask ( () => {

      this.scheduled = false;

      this.flush ();

    });

  }

}

/* EXPORT */

export default new Scheduler ();
