
/* IMPORT */

import {NOOP, SUSPENSE} from '~/constants';
import Effect from '~/objects/effect';
import type {DisposeFunction, EffectFunction} from '~/types';

/* MAIN */

const effect = ( fn: EffectFunction ): DisposeFunction => {

  const effect = new Effect ( fn );

  if ( !effect.observables && !SUSPENSE.current?.suspended ) { // It can never run again, freeing up some memory

    effect.fn = NOOP;

  }

  return effect.dispose.bind ( effect, true, true );

};

/* EXPORT */

export default effect;
