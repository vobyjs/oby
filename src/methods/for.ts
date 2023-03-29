
/* IMPORT */

import cleanup from '~/methods/cleanup';
import CacheKeyed from '~/methods/for.cache.keyed';
import CacheUnkeyed from '~/methods/for.cache.unkeyed';
import get from '~/methods/get';
import isStore from '~/methods/is_store';
import memo from '~/methods/memo';
import resolve from '~/methods/resolve';
import untrack from '~/methods/untrack';
import {SYMBOL_CACHED, SYMBOL_STORE_VALUES} from '~/symbols';
import {isArray, isEqual} from '~/utils';
import type {MapFunction, MapValueFunction, ObservableReadonly, FunctionMaybe, Resolved} from '~/types';

/* MAIN */

function _for <T, R, F> ( values: FunctionMaybe<readonly T[]>, fn: MapFunction<T, R>, fallback?: F | [], options?: { unkeyed?: false } ): ObservableReadonly<Resolved<R>[] | Resolved<F>>;
function _for <T, R, F> ( values: FunctionMaybe<readonly T[]>, fn: MapValueFunction<T, R>, fallback?: F | [], options?: { unkeyed?: true } ): ObservableReadonly<Resolved<R>[] | Resolved<F>>;
function _for <T, R, F> ( values: FunctionMaybe<readonly T[]>, fn: MapFunction<T, R> | MapValueFunction<T, R>, fallback: F | [] = [], options?: { unkeyed?: boolean } ): ObservableReadonly<Resolved<R>[] | Resolved<F>> {

  const {dispose, map} = options?.unkeyed ? new CacheUnkeyed ( fn as MapValueFunction<T, R> ) : new CacheKeyed ( fn as MapFunction<T, R> ); //TSC

  cleanup ( dispose );

  const value = memo ( () => {

    return get ( values );

  }, {

    equals: ( next, prev ) => {

      return !!next && !!prev && !next.length && !prev.length && !isStore ( next ) && !isStore ( prev );

    }

  });

  return memo ( () => {

    const array = value ();

    if ( isStore ( array ) ) {

      array[SYMBOL_STORE_VALUES];

    }

    return untrack ( () => {

      const results = map ( array );

      return results?.length ? results : resolve ( fallback );

    });

  }, {

    equals: ( next, prev ) => {

      return isArray ( next ) && !!next[SYMBOL_CACHED] && isArray ( prev ) && isEqual ( next, prev );

    }

  });

}

/* EXPORT */

export default _for;
