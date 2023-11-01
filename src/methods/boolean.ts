
/* IMPORT */

import isObservableBoolean from './is_observable_boolean';
import isObservableFrozen from '~/methods/is_observable_frozen';
import isUntracked from '~/methods/is_untracked';
import memo from '~/methods/memo';
import {SYMBOL_OBSERVABLE_BOOLEAN} from '~/symbols';
import {isFunction} from '~/utils';
import type {FunctionMaybe} from '~/types';

/* MAIN */

const boolean = ( value: FunctionMaybe<unknown> ): FunctionMaybe<boolean> => {

  if ( isFunction ( value ) ) {

    if ( isObservableFrozen ( value ) || isUntracked ( value ) ) {

      return !!value ();

    } else if ( isObservableBoolean ( value ) ) {

      return value;

    } else {

      const boolean = memo ( () => !!value () );

      boolean[SYMBOL_OBSERVABLE_BOOLEAN] = true;

      return boolean;

    }

  } else {

    return !!value;

  }

};

/* EXPORT */

export default boolean;
