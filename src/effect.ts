
/* IMPORT */

import Observer from './observer';
import Owner from './owner';
import {isArray} from './utils';
import {DisposeFunction, EffectFunction} from './types';

/* MAIN */

class Effect extends Observer {

  /* VARIABLES */

  private fn: EffectFunction;

  /* CONSTRUCTOR */

  constructor ( fn: EffectFunction ) {

    super ();

    this.fn = fn;

    this.update ();

  }

  /* API */

  isDisposable (): boolean {

    const {observers, observables, cleanups} = this;

    if ( observers ) {
      if ( isArray ( observers ) ) {
        if ( observers.length ) {
          return false;
        }
      } else {
        return false;
      }
    }

    if ( observables ) {
      if ( isArray ( observables ) ) {
        if ( observables.length ) {
          return false;
        }
      } else {
        return false;
      }
    }

    if ( cleanups ) {
      if ( isArray ( cleanups ) ) {
        if ( cleanups.length ) {
          return false;
        }
      } else {
        return false;
      }
    }

    return true;

  }

  dispose (): void {

    Owner.unregisterObserver ( this );

    Observer.unsubscribe ( this );

  }

  update (): void {

    Owner.registerObserver ( this );

    if ( this.dirty !== undefined ) { // Skipping unusbscription during the first execution

      Observer.unsubscribe ( this );

    }

    this.dirty = false;

    try {

      const cleanup = Owner.wrapWith ( this.fn, this );

      if ( cleanup ) {

        this.registerCleanup ( cleanup );

      } else {

        if ( this.isDisposable () ) {

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
