
/* IMPORT */

import memo from '~/methods/memo';
import unwrap from '~/methods/unwrap';
import {isFunction} from '~/utils';
import type {FunctionMaybe} from '~/types';

/* MAIN */

const boolean = ( value: FunctionMaybe<unknown> ): FunctionMaybe<boolean> => {

  if ( isFunction ( value ) ) {

    return unwrap ( memo ( () => !!value () ) );

  } else {

    return !!value;

  }

};

/* EXPORT */

export default boolean;
