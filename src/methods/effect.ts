
/* IMPORT */

import Effect from '~/objects/effect';
import type {DisposeFunction, EffectFunction, EffectOptions} from '~/types';

/* MAIN */

const effect = ( fn: EffectFunction, options?: EffectOptions ): DisposeFunction => {

  const effect = new Effect ( fn, options );
  const dispose = () => effect.dispose ( true );

  return dispose;

};

/* EXPORT */

export default effect;
