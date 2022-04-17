
/* IMPORT */

import Computed from './computed';
import Effect from './effect';
import Observable from './observable';
import type {PlainReaction} from './types';

/* MAIN */

const Reaction = {

  /* API */

  stale: ( reaction: PlainReaction, fresh: boolean ): void => {

    const count = ( reaction.stale >>> 1 ) + 1;
    const freshbit = fresh ? 1 : reaction.stale & 1;
    const stale = ( count << 1 ) | freshbit;

    reaction.stale = stale;

    if ( count === 1 && 'observable' in reaction ) {

      Observable.emitStale ( reaction.observable, !!freshbit );

    }

  },

  unstale: ( reaction: PlainReaction, fresh: boolean ): void => {

    if ( !reaction.stale ) return; //TODO: If this ever happens we probably hit a bug

    const count = ( reaction.stale >>> 1 ) - 1;
    const freshbit = fresh ? 1 : reaction.stale & 1;
    const stale = ( count << 1 ) | freshbit;

    reaction.stale = stale;

    if ( !count ) {

      reaction.stale = 0;

      Reaction.update ( reaction, !!freshbit );

    }

  },

  update: ( reaction: PlainReaction, fresh: boolean ): void => {

    if ( 'observable' in reaction ) {

      Computed.update ( reaction, fresh );

    } else {

      Effect.update ( reaction, fresh );

    }

  }

};

/* EXPORT */

export default Reaction;
