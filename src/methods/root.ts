
/* IMPORT */

import Root from '~/objects/root';
import type {ObservedDisposableFunction} from '~/types';

/* MAIN */

const root = <T> ( fn: ObservedDisposableFunction<T> ): T => {

  return new Root ().wrap ( fn )!; //TSC: Assuming it won't throw, for convenience, but slightly incorrect

};

/* EXPORT */

export default root;

//TODO: REVIEW
