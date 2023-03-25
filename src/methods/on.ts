
/* IMPORT */

import untrack from '~/methods/untrack';
import {SYMBOL_ON_CALLBACK, SYMBOL_ON_DEPENDENCIES} from '~/symbols';
import type {ObservableReadonly} from '~/types';

/* MAIN */

const on = <T> ( dependencies: ObservableReadonly[], callback: () => T ): (() => T) => {

  const onCallback = () => untrack ( callback );

  onCallback[SYMBOL_ON_CALLBACK] = callback;
  onCallback[SYMBOL_ON_DEPENDENCIES] = dependencies;

  return onCallback;

};

/* EXPORT */

export default on;
