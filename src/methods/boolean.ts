
/* IMPORT */

import memo from '~/methods/memo';
import {isFunction} from '~/utils';
import type {FunctionMaybe} from '~/types';

/* MAIN */

const boolean = ( value: FunctionMaybe<unknown> ): FunctionMaybe<boolean> => {

  if ( !isFunction ( value ) ) return !!value;

  return memo ( () => !!value () );

};

/* EXPORT */

export default boolean;
