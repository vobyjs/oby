
/* IMPORT */

import Effect from '~/objects/effect';
import type {DisposeFunction, EffectFunction} from '~/types';

/* MAIN */

const effect = ( fn: EffectFunction ): DisposeFunction => {

  const effect = new Effect ( fn );

  return effect.dispose.bind ( effect, true, true );

};

/* EXPORT */

export default effect;
