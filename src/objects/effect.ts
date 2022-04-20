
/* IMPORT */

import Reaction from '~/objects/reaction';
import type {EffectFunction} from '~/types';

/* MAIN */

class Effect extends Reaction {

  /* VARIABLES */

  fn: EffectFunction;

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

      this.dispose ();

      try {

        const cleanup = this.wrap ( this.fn );

        if ( cleanup ) {

          this.registerCleanup ( cleanup );

        } else {

          if ( !this.observers && !this.observables && !this.cleanups ) { // Auto-disposable

            this.dispose ( true );

          }

        }

      } catch ( error: unknown ) {

        this.error ( error, false );

      }

    }

  }

}

/* EXPORT */

export default Effect;
