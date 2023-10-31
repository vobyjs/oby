
/* IMPORT */

import isObservableFrozen from '~/methods/is_observable_frozen';
import isUntracked from '~/methods/is_untracked';
import {isFunction} from '~/utils';
import type {FunctionMaybe} from '~/types';

/* MAIN */

//FIXME: This is just an ugly variant of "boolean" that doesn't create an unnecessary memo wrapper, figure out a better way to do it. Maybe make a more general "switch" where the condition is a function, so we don't need this anymore

const boolean2 = ( value: FunctionMaybe<unknown> ): FunctionMaybe<boolean> => {

  if ( isFunction ( value ) ) {

    if ( isObservableFrozen ( value ) || isUntracked ( value ) ) {

      return !!value ();

    } else {

      return () => !!value ();

    }

  } else {

    return !!value;

  }

};

/* EXPORT */

export default boolean2;
