
/* IMPORT */

import suspended from '~/methods/suspended';
import Computation from '~/objects/computation';
import {getExecution, setExecution} from '~/status';
import {castError, isFunction, max} from '~/utils';
import type {ReactionFunction} from '~/types';

/* MAIN */

class Reaction extends Computation {

  /* VARIABLES */

  fn: ReactionFunction;

  /* CONSTRUCTOR */

  constructor ( fn: ReactionFunction, pausable?: boolean ) {

    super ();

    this.fn = fn;

    this.parent.registerObserver ( this );

    if ( pausable && suspended () ) {

      this.emit ( 1, true );

    } else {

      this.update ( true );

    }

  }

  /* API */

  update ( fresh: boolean ): void {

    if ( fresh && !this.signal.disposed ) { // Something might change

      const status = getExecution ( this.status );

      if ( status ) { // Currently executing or pending

        this.status = setExecution ( this.status, fresh ? 3 : max ( status, 2 ) );

      } else { // Currently sleeping

        this.status = setExecution ( this.status, 1 );

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

          this.catch ( castError ( error ), false );

        } finally {

          const status = getExecution ( this.status );

          this.status = setExecution ( this.status, 0 );

          if ( status > 1 ) {

            this.update ( status === 3 );

          }

        }

      }

    }

  }

}

/* EXPORT */

export default Reaction;
