
/* IMPORT */

import {FALSE, TRUE} from '~/constants';
import memo from '~/methods/memo';
import {isFunction} from '~/utils';
import type {FunctionMaybe} from '~/types';

/* MAIN */

const boolean = ( value: FunctionMaybe<unknown> ): (() => boolean) => {

  if ( !isFunction ( value ) ) return value ? TRUE : FALSE;

  return memo ( () => !!value () );

};

/* EXPORT */

export default boolean;
