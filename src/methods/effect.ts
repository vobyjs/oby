
/* IMPORT */

import Effect from '~/objects/effect';
import type {DisposeFunction, EffectFunction} from '~/types';

/* MAIN */

const effect = ( fn: EffectFunction ): DisposeFunction => {

  const effect = new Effect ( fn );
  const dispose = effect.dispose.bind ( effect, true, true );

  return dispose;

};

/* EXPORT */

export default effect;
