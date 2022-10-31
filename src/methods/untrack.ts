
/* IMPORT */

import {OWNER} from '~/constants';
import Observer from '~/objects/observer';
import {isFunction} from '~/utils';
import type {UntrackFunction} from '~/types';

/* HELPERS */

const wrap = Observer.prototype.wrap; // This avoids a wrapper identity function

/* MAIN */

function untrack <T> ( fn: UntrackFunction<T> ): T;
function untrack <T> ( fn: T ): T;
function untrack <T> ( fn: UntrackFunction<T> | T ) {

  if ( isFunction ( fn ) ) {

    return wrap.call ( OWNER.current, fn, false );

  } else {

    return fn;

  }

}

/* EXPORT */

export default untrack;
