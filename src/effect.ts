
/* IMPORT */

import Observer from './observer';
import Owner from './owner';
import {DisposeFunction, EffectFunction} from './types';

/* MAIN */

class Effect extends Observer {

  /* VARIABLES */

  private fn: EffectFunction;

  /* CONSTRUCTOR */

  constructor ( fn: EffectFunction ) {

    super ();

    this.fn = fn;

    Owner.registerObserver ( this );

    this.update ();

  }

  /* API */

  update (): void {

    if ( this.dirty !== undefined ) { // Skipping unusbscription during the first execution

      this.dispose ();

    }

    this.dirty = false;

    try {

      const cleanup = Owner.wrapWith ( this.fn, this );

      if ( cleanup ) {

        this.registerCleanup ( cleanup );

      } else {

        if ( !this.observers && !this.observables && !this.cleanups ) { // Auto-disposable

          this.dispose ();

        }

      }

    } catch ( error: unknown ) {

      this.updateError ( error );

    }

  }

  /* STATIC API */

  static wrap ( fn: EffectFunction ): DisposeFunction {

    const effect = new Effect ( fn );

    return effect.dispose.bind ( effect );

  }

}

/* EXPORT */

export default Effect;
