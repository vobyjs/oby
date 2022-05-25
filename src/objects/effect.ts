
/* IMPORT */

import {SUSPENSE} from '~/constants';
import Reaction from '~/objects/reaction';
import {castError, isFunction, max} from '~/utils';
import type {ISuspense, EffectFunction} from '~/types';

/* MAIN */

class Effect extends Reaction {

  /* VARIABLES */

  fn: EffectFunction;
  suspense?: ISuspense; //TODO: Try to delete this, it may not be strictly necessary if the regular tree of observers is traversed

  /* CONSTRUCTOR */

  constructor ( fn: EffectFunction ) {

    super ();

    this.fn = fn;

    this.parent.registerObserver ( this );

    if ( SUSPENSE.current ) {

      this.suspense = SUSPENSE.current;
      this.suspense.registerEffect ( this );

    }

    if ( this.suspense?.suspended ) {

      this.stale ( true );

    } else {

      this.update ( true );

    }

  }

  /* API */

  dispose ( deep?: boolean, immediate?: boolean ): void {

    if ( deep ) {

      this.suspense?.unregisterEffect ( this );

    }

    super.dispose ( deep, immediate );

  }

  update ( fresh: boolean ): void {

    if ( fresh && !this.signal.disposed ) { // Something might change

      const status = this.statusExecution;

      if ( status ) { // Currently executing or pending

        this.statusExecution = fresh ? 3 : max ( status, 2 );

      } else { // Currently sleeping

        this.statusExecution = 1;

        this.dispose ();

        try {

          const cleanup = this.wrap ( this.fn );

          this.postdispose ();

          if ( isFunction ( cleanup ) ) {

            this.registerCleanup ( cleanup );

          } else {

            if ( !this.observers && !this.observables && !this.cleanups ) { // Auto-disposable

              this.dispose ( true, true );

            }

          }

        } catch ( error: unknown ) {

          this.postdispose ();

          this.error ( castError ( error ), false );

        } finally {

          const status = this.statusExecution as ( 1 | 2 | 3 ); //TSC

          this.statusExecution = 0;

          if ( status > 1 ) {

            this.update ( status === 3 );

          }

        }

      }

    }

  }

}

/* EXPORT */

export default Effect;
