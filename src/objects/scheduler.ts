
/* IMPORT */

import type {IEffect} from '~/types';

/* MAIN */

class Scheduler {

  /* VARIABLES */

  batch?: Promise<void>;
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

    // if ( this.running.has ( effect ) ) return; //TODO: more sophisticated maybe

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

      queueMicrotask ( () => {

        const batch = this.batch;

        if ( batch ) {

          batch.finally ( () => {

            queueMicrotask ( () => {

              queueMicrotask ( () => {

                this.scheduled = false;

                this.flush ();

              });

            });

          });

        } else {

          this.scheduled = false;

          this.flush ();

        }

      });

    });

  }

}

/* EXPORT */

export default new Scheduler ();
