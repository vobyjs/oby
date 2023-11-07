
/* IMPORT */

import {effectNew} from '../objects/effect';
import {ownerDispose} from '../objects/owner';
import type {DisposeFunction, EffectFunction, EffectOptions} from '../types';

/* MAIN */

const effect = ( fn: EffectFunction, options?: EffectOptions ): DisposeFunction => {

  const effect = effectNew ( fn, options );
  const dispose = () => ownerDispose ( effect, true, true );

  return dispose;

};

/* EXPORT */

export default effect;
