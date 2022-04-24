
/* IMPORT */

import type {ProduceFunction} from '~/types';

/* MAIN */

// This is largely just an extension point, this function should be overridden with immer's produce function if this function is to actually be used in production

const produce = <T> ( value: T, fn: ProduceFunction<T, T> ): T => {

  const valueClone: T = JSON.parse ( JSON.stringify ( value ) );
  const valueResult = fn ( valueClone );
  const valueNext = ( valueResult === undefined ? valueClone : valueResult );

  return valueNext;

};

/* EXPORT */

export default produce;
