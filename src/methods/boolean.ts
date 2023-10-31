
/* IMPORT */

import isObservableFrozen from '~/methods/is_observable_frozen';
import isUntracked from '~/methods/is_untracked';
import memo from '~/methods/memo';
import {isFunction} from '~/utils';
import type {FunctionMaybe} from '~/types';

/* MAIN */

const boolean = ( value: FunctionMaybe<unknown> ): FunctionMaybe<boolean> => {

  if ( isFunction ( value ) ) {

    if ( isObservableFrozen ( value ) || isUntracked ( value ) ) {

      return !!value ();

    } else {

      return memo ( () => !!value () );

    }

  } else {

    return !!value;

  }

};

/* EXPORT */

export default boolean;
