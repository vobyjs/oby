
/* IMPORT */

import {NOOP} from '~/constants';
import Reaction from '~/objects/reaction';
import type {DisposeFunction, ReactionFunction} from '~/types';

/* MAIN */

const reaction = ( fn: ReactionFunction ): DisposeFunction => {

  const reaction = new Reaction ( fn );

  if ( !reaction.observables ) { // It can never run again, freeing up some memory

    reaction.fn = NOOP;

  }

  return reaction.dispose.bind ( reaction, true, true );

};

/* EXPORT */

export default reaction;
