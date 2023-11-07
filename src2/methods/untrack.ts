
/* IMPORT */

import {OWNER} from '../context';
import {ownerWrap} from '../objects/owner';
import {isFunction} from '../utils';
import type {FunctionMaybe, UntrackFunction} from '../types';

/* MAIN */

function untrack <T> ( fn: FunctionMaybe<T> ): T;
function untrack <T> ( fn: UntrackFunction<T> ): T;
function untrack <T> ( fn: T ): T;
function untrack <T> ( fn: UntrackFunction<T> | T ) {

  if ( isFunction ( fn ) ) {

    return ownerWrap ( fn, OWNER, false ); //TODO: Maybe inline this one

  } else {

    return fn;

  }

}

/* EXPORT */

export default untrack;
