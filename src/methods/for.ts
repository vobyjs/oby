
/* IMPORT */

import cleanup from '~/methods/cleanup';
import computed from '~/methods/computed';
import Cache from '~/methods/for.cache';
import resolve from '~/methods/resolve';
import {isFunction} from '~/utils';
import type {MapFunction, ObservableReadonly, FunctionMaybe, Resolved} from '~/types';

/* MAIN */

const _for = <T, R, F> ( values: FunctionMaybe<readonly T[]>, fn: MapFunction<T, R>, fallback: F | [] = [] ): ObservableReadonly<Resolved<R>[] | Resolved<F>> => {

  const cache = new Cache ( fn );
  const {dispose, before, after, map} = cache;

  cleanup ( dispose );

  return computed ( () => {

    const array = isFunction ( values ) ? values () : values;

    before ( array );

    const result = array.length ? array.map ( map ) : resolve ( fallback );

    after ( array );

    return result;

  });

};

/* EXPORT */

export default _for;
