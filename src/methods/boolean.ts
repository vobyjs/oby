
/* IMPORT */

import memo from '~/methods/memo';
import {isFunction} from '~/utils';
import type {FunctionMaybe} from '~/types';

/* MAIN */

//TODO: Maybe make the memo sync, so that it can be unwrapped? Or like, just call it immediately, maybe just do that in unwrap

const boolean = ( value: FunctionMaybe<unknown> ): FunctionMaybe<boolean> => {

  if ( isFunction ( value ) ) {

    return memo ( () => !!value () );

  } else {

    return !!value;

  }

};

/* EXPORT */

export default boolean;
