
/* IMPORT */

import Root from '~/objects/root';
import type {ObservedDisposableFunction} from '~/types';

/* MAIN */

const root = <T> ( fn: ObservedDisposableFunction<T> ): T => {

  return new Root ( true ).wrap ( fn );

};

/* EXPORT */

export default root;
