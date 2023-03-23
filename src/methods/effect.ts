
/* IMPORT */

import Effect from '~/objects/effect';
import type {DisposeFunction, EffectFunction} from '~/types';

/* MAIN */

//TODO: Add special support for listening, deleting on/off/and direct listeners

const effect = ( fn: EffectFunction ): DisposeFunction => {

  const effect = new Effect ( fn );
  const dispose = () => effect.dispose ();

  return dispose;

};

/* EXPORT */

export default effect;
