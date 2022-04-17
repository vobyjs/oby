
/* IMPORT */

import Computed from './computed';
import Effect from './effect';
import Observable from './observable';
import type {PlainReaction} from './types';

/* MAIN */

const Reaction = {

  /* API */

  stale: ( reaction: PlainReaction, fresh: boolean ): void => {

    reaction.staleCount += 1;

    if ( reaction.staleCount === 1 && 'observable' in reaction ) {

      Observable.emitStale ( reaction.observable, fresh );

    }

    if ( fresh ) {

      reaction.staleFresh = true;

    }

  },

  unstale: ( reaction: PlainReaction, fresh: boolean ): void => {

    if ( !reaction.staleCount ) return; //TODO: If this ever happens we probably hit a bug

    reaction.staleCount -= 1;

    if ( fresh ) {

      reaction.staleFresh = true;

    }

    if ( !reaction.staleCount ) {

      const fresh = reaction.staleFresh;

      reaction.staleFresh = false;

      Reaction.update ( reaction, fresh );

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
