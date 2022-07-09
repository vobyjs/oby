
/* IMPORT */

import {SYMBOL_STORE_VALUES} from '~/constants';
import cleanup from '~/methods/cleanup';
import computed from '~/methods/computed';
import get from '~/methods/get';
import isStore from '~/methods/is_store';
import sample from '~/methods/sample';
import resolve from '~/methods/resolve';
import type Cache from '~/methods/for_abstract.cache';
import type {ObservableReadonly, FunctionMaybe, CallableFunction, Constructor, Resolved} from '~/types';

/* MAIN */

const forAbstract = <T, R, F> ( Cache: Constructor<Cache<T, R>, [CallableFunction]>, values: FunctionMaybe<readonly T[]>, fn: CallableFunction, fallback: F | [] = [] ): ObservableReadonly<Resolved<R>[] | Resolved<F>> => {

  const cache = new Cache ( fn );
  const {dispose, map} = cache;

  cleanup ( dispose );

  return computed ( () => {

    const array = get ( values );

    if ( isStore ( array ) ) array[SYMBOL_STORE_VALUES];

    return sample ( () => array.length ? map ( array ) || resolve ( fallback ) : resolve ( fallback ) );

  });

};

/* EXPORT */

export default forAbstract;
