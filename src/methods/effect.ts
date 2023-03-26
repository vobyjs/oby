
/* IMPORT */

import Effect from '~/objects/effect';
import type {DisposeFunction, EffectFunction, EffectOptions} from '~/types';

/* MAIN */

//TODO: Add special support for listening, deleting on/off/and direct listeners

const effect = ( fn: EffectFunction, options?: EffectOptions ): DisposeFunction => {

  const effect = new Effect ( fn, options );
  const dispose = () => effect.dispose ();

  return dispose;

};

/* EXPORT */

export default effect;

//TODO: REVIEW
