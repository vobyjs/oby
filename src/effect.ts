
/* IMPORT */

import Observer from './observer';
import Owner from './owner';
import type {DisposeFunction, EffectFunction, PlainEffect} from './types';

/* MAIN */

const Effect = {

  /* WRAPPING API */

  wrap: ( fn: EffectFunction ): DisposeFunction => {

    const effect = Effect.create ( fn );

    return Observer.dispose.bind ( undefined, effect );

  },

  /* API */

  create: ( fn: EffectFunction ): PlainEffect => {

    const effect: PlainEffect = {
      symbol: 4,
      staleCount: 0,
      staleFresh: false,
      cleanups: [],
      context: {},
      errors: [],
      observables: [],
      observers: [],
      parent: Owner.get (),
      fn
    };

    Owner.registerObserver ( effect );

    Effect.update ( effect, true );

    return effect;

  },

  update: ( effect: PlainEffect, fresh: boolean ): void => {

    if ( fresh ) { // Something might change

      Observer.dispose ( effect );

      try {

        const cleanup = Owner.wrapWith ( effect.fn, effect );

        if ( cleanup ) {

          Observer.registerCleanup ( effect, cleanup );

        } else {

          if ( !effect.observers.length && !effect.observables.length && !effect.cleanups.length ) { // Auto-disposable

            Observer.dispose ( effect );

            Owner.unregisterObserver ( effect );

          }

        }

      } catch ( error: unknown ) {

        Observer.updateError ( effect, error );

      }

    }

  }

};

/* EXPORT */

export default Effect;
