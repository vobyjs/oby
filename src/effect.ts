
/* IMPORT */

import Context from './context';
import Observer from './observer';
import {isArray} from './utils';
import {EffectFunction} from './types';

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

  update (): void {

    Context.registerObserver ( this );

    Observer.unsubscribe ( this );

    delete this.dirty;

    try {

      const cleanup = Context.wrapWith ( () => this.fn (), this, false );

      if ( cleanup ) {

        this.registerCleanup ( cleanup );

      }

      if ( this.isDisposable () ) {

        Context.unregisterObserver ( this );

        Observer.unsubscribe ( this );

      }

    } catch ( error: unknown ) {

      this.updateError ( error );

    }

  }

  /* STATIC API */

  static wrap ( fn: EffectFunction ): void {

    new Effect ( fn );

  }

}

/* EXPORT */

export default Effect;
