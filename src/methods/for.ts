
/* IMPORT */

import {SYMBOL_STORE_VALUES} from '~/constants';
import cleanup from '~/methods/cleanup';
import computed from '~/methods/computed';
import get from '~/methods/get';
import isStore from '~/methods/is_store';
import sample from '~/methods/sample';
import Cache from '~/methods/for.cache';
import resolve from '~/methods/resolve';
import type {MapFunction, ObservableReadonly, FunctionMaybe, Resolved} from '~/types';

/* MAIN */

const _for = <T, R, F> ( values: FunctionMaybe<readonly T[]>, fn: MapFunction<T, R>, fallback: F | [] = [] ): ObservableReadonly<Resolved<R>[] | Resolved<F>> => {

  const cache = new Cache ( fn );
  const {dispose, before, after, map} = cache;

  cleanup ( dispose );

  return computed ( () => {

    const array = get ( values );

    if ( isStore ( array ) ) array[SYMBOL_STORE_VALUES];

    before ( array );

    const result = sample ( () => array.length ? array.map ( map ) : resolve ( fallback ) );

    after ( array );

    return result;

  });

};

/* EXPORT */

export default _for;
