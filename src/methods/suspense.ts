
/* IMPORT */

import boolean from '~/methods/boolean';
import effect from '~/methods/effect';
import get from '~/methods/get';
import Suspense from '~/objects/suspense';
import type {SuspenseFunction, FunctionMaybe} from '~/types';

/* MAIN */

const suspense = <T> ( when: FunctionMaybe<unknown>, fn: SuspenseFunction<T> ): T => {

  const suspense = new Suspense ();
  const condition = boolean ( when );

  effect ( () => {

    suspense.toggle ( get ( condition ) );

  }, { sync: true } );

  return suspense.wrap ( fn )!; //TSC: Assuming it won't throw, for convenience, but slightly incorrect

};

/* EXPORT */

export default suspense;
