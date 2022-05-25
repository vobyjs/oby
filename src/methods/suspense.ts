
/* IMPORT */

import computed from '~/methods/computed';
import effect from '~/methods/effect';
import Suspense from '~/objects/suspense';
import {isFunction} from '~/utils';
import type {SuspenseFunction, FunctionMaybe} from '~/types';

/* MAIN */

const suspense = <T> ( when: FunctionMaybe<unknown>, fn: SuspenseFunction<T> ): T => {

  const suspense = new Suspense ();
  const condition = computed ( () => isFunction ( when ) ? !!when () : !!when );

  effect ( () => {

    suspense.toggle ( condition () );

  });

  return suspense.wrap ( fn );

};

/* EXPORT */

export default suspense;
