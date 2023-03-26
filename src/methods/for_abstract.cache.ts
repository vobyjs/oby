
/* TYPES */

import type {CallableFunction, Resolved} from '~/types';

/* MAIN */

class Cache<T, R> {

  /* CONSTRUCTOR */

  constructor ( fn: CallableFunction ) {}

  /* API */

  dispose (): void {}

  map ( values: readonly T[] ): Resolved<R>[] | void {}

}

/* EXPORT */

export default Cache;

//TODO: REVIEW
