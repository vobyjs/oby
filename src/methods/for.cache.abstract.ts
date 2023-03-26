
/* TYPES */

import type {CallableFunction, Resolved} from '~/types';

/* MAIN */

class CacheAbstract<T, R> {

  /* CONSTRUCTOR */

  constructor ( fn: CallableFunction ) {}

  /* API */

  dispose (): void {}

  map ( values: readonly T[] ): Resolved<R>[] | void {}

}

/* EXPORT */

export default CacheAbstract;

//TODO: REVIEW
