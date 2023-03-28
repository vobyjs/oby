
/* IMPORT */

import Root from '~/objects/root';
import type {WrappedDisposableFunction} from '~/types';

/* MAIN */

const root = <T> ( fn: WrappedDisposableFunction<T> ): T => {

  return new Root ().wrap ( fn );

};

/* EXPORT */

export default root;
