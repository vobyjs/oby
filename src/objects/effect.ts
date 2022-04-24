
/* IMPORT */

import Reaction from '~/objects/reaction';
import {castError, isFunction} from '~/utils';
import type {EffectFunction} from '~/types';

/* MAIN */

class Effect extends Reaction {

  /* VARIABLES */

  fn: EffectFunction;
  iteration: number = 0; //FIXME: This shouldn't be necessary

  /* CONSTRUCTOR */

  constructor ( fn: EffectFunction ) {

    super ();

    this.fn = fn;

    this.parent.registerObserver ( this );

    this.update ( true );

  }

  /* API */

  update ( fresh: boolean ): void {

    if ( fresh ) { // Something might change

      if ( this.iteration ) { // Currently executing, cleaning up any leftovers

        this.postdispose ();

      }

      this.dispose ();

      try {

        const iteration = ( this.iteration += 1 );
        const cleanup = this.wrap ( this.fn );

        this.postdispose ();

        if ( iteration === this.iteration ) { // No other instance of this effect currently running

          if ( isFunction ( cleanup ) ) {

            this.registerCleanup ( cleanup );

          } else {

            if ( !this.observers && !this.observables && !this.cleanups ) { // Auto-disposable

              this.dispose ( true, true );

            }

          }

        }

      } catch ( error: unknown ) {

        this.postdispose ();

        this.error ( castError ( error ), false );

      }

    }

  }

}

/* EXPORT */

export default Effect;
