
/* IMPORT */

import untrack from '~/methods/untrack';
import {SYMBOL_ON_CALLBACK, SYMBOL_ON_DEPENDENCIES} from '~/symbols';
import type {ObservableReadonly} from '~/types';

/* MAIN */

//TODO: return current and prev values in effect
//TODO: make this  memory efficient like direct listeners, somehow, maybee che scheduler should accept callable things

const on = <T> ( dependencies: ObservableReadonly[], fn: () => T ): (() => T) => {

  const callback = () => untrack ( fn );

  callback[SYMBOL_ON_CALLBACK] = fn;
  callback[SYMBOL_ON_DEPENDENCIES] = dependencies;

  return callback;

};

/* EXPORT */

export default on;
