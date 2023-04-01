
/* IMPORT */

import untrack from '~/methods/untrack';
import type {ObservableReadonly} from '~/types';

/* MAIN */

// This function ensures an Observable contains a fresh value, mainly to try to push it into a frozen state, if possible

const warmup = <T> ( value: ObservableReadonly<T> ): ObservableReadonly<T> => {

  untrack ( value );

  return value;

};

/* EXPORT */

export default warmup;
