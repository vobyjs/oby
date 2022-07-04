
/* TYPES */

import type {CallableFunction, Resolved} from '~/types';

/* MAIN */

class Cache<T, R> {

  /* CONSTRUCTOR */

  constructor ( fn: CallableFunction ) {}

  /* API */

  dispose (): void {}
  before ( values: readonly T[] ): void {}
  after ( values: readonly T[] ): void {}
  map ( values: readonly T[] ): Resolved<R>[] | void {}

};

/* EXPORT */

export default Cache;
