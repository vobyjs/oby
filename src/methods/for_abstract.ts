
/* IMPORT */

import cleanup from '~/methods/cleanup';
import get from '~/methods/get';
import isStore from '~/methods/is_store';
import memo from '~/methods/memo';
import resolve from '~/methods/resolve';
import untrack from '~/methods/untrack';
import {SYMBOL_CACHED, SYMBOL_STORE_VALUES} from '~/symbols';
import {isArray} from '~/utils';
import type Cache from '~/methods/for_abstract.cache';
import type {ObservableReadonly, FunctionMaybe, CallableFunction, Constructor, Resolved} from '~/types';

/* MAIN */

const forAbstract = <T, R, F> ( Cache: Constructor<Cache<T, R>, [CallableFunction]>, values: FunctionMaybe<readonly T[]>, fn: CallableFunction, fallback: F | [] = [] ): ObservableReadonly<Resolved<R>[] | Resolved<F>> => {

  const cache = new Cache ( fn );
  const {dispose, map} = cache;

  cleanup ( dispose );

  const value = memo ( () => {
    return get ( values );
  }, {
    equals: ( a, b ) => {
      return !!a && !!b && !a.length && !b.length && !isStore ( a ) && !isStore ( b );
    }
  });

  let resultsPrev: Resolved<R>[] | Resolved<F> | undefined;

  return memo ( () => {

    const array = value ();

    if ( isStore ( array ) ) array[SYMBOL_STORE_VALUES];

    const resultsNext = untrack ( () => {

      const results = map ( array );

      return results?.length ? results : resolve ( fallback );

    });

    // if ( isArray ( resultsNext ) && resultsNext[SYMBOL_CACHED] && isArray ( resultsPrev ) ) return resultsPrev;

    resultsPrev = resultsNext;

    return resultsNext

  });

};

/* EXPORT */

export default forAbstract;
