
/* IMPORT */

import Reaction from '~/objects/reaction';
import type {EffectFunction} from '~/types';

/* MAIN */

class Effect extends Reaction {

  /* CONSTRUCTOR */

  constructor ( fn: EffectFunction ) {

    super ( fn, true );

  }

}

/* EXPORT */

export default Effect;
