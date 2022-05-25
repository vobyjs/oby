
/* IMPORT */

import {FALSE, TRUE} from '~/constants';
import computed from '~/methods/computed';
import {isFunction} from '~/utils';
import type {FunctionMaybe} from '~/types';

/* MAIN */

const boolean = ( value: FunctionMaybe<unknown> ): (() => boolean) => {

  if ( !isFunction ( value ) ) return value ? TRUE : FALSE;

  return computed ( () => !!value () );

};

/* EXPORT */

export default boolean;
