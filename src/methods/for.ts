
/* IMPORT */

import cleanup from '~/methods/cleanup';
import get from '~/methods/get';
import isStore from '~/methods/is_store';
import memo from '~/methods/memo';
import resolve from '~/methods/resolve';
import untrack from '~/methods/untrack';
import {SYMBOL_CACHED, SYMBOL_STORE_VALUES} from '~/symbols';
import {isArray, isEqual} from '~/utils';

import CacheUnkeyed from '~/methods/for.cache.unkeyed';
import CacheKeyed from '~/methods/for.cache.keyed';
import type {MapFunction, MapValueFunction, ObservableReadonly, FunctionMaybe, Resolved} from '~/types';

/* MAIN */

function _for <T, R, F> ( values: FunctionMaybe<readonly T[]>, fn: MapFunction<T, R>, fallback?: F | [], recycle?: false ): ObservableReadonly<Resolved<R>[] | Resolved<F>>;
function _for <T, R, F> ( values: FunctionMaybe<readonly T[]>, fn: MapValueFunction<T, R>, fallback?: F | [], recycle?: true ): ObservableReadonly<Resolved<R>[] | Resolved<F>>;
function _for <T, R, F> ( values: FunctionMaybe<readonly T[]>, fn: MapFunction<T, R> | MapValueFunction<T, R>, fallback: F | [] = [], recycle?: boolean ): ObservableReadonly<Resolved<R>[] | Resolved<F>> {

  const cache = recycle ? new CacheUnkeyed ( fn ) : new CacheKeyed ( fn );
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

    if ( isArray ( resultsNext ) && resultsNext[SYMBOL_CACHED] && isArray ( resultsPrev ) && isEqual ( resultsNext, resultsPrev ) ) return resultsPrev;

    resultsPrev = resultsNext;

    return resultsNext

  });


}

/* EXPORT */

export default _for;

//TODO: REVIEW
