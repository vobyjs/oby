
/* IMPORT */

import cleanup from '~/methods/cleanup';
import computed from '~/methods/computed';
import sample from '~/methods/sample';
import Cache from '~/methods/for_index.cache';
import resolve from '~/methods/resolve';
import {isFunction} from '~/utils';
import type {MapIndexFunction, ObservableReadonly, FunctionMaybe, Indexed, Resolved} from '~/types';

/* MAIN */

const forIndex = <T, R, F> ( values: FunctionMaybe<readonly T[]>, fn: MapIndexFunction<Indexed<T>, R>, fallback: F | [] = [] ): ObservableReadonly<Resolved<R>[] | Resolved<F>> => {

  const cache = new Cache ( fn );
  const {dispose, map} = cache;

  cleanup ( dispose );

  return computed ( () => {

    const array = isFunction ( values ) ? values () : values;
    const result = sample ( () => array.length ? map ( array ) : resolve ( fallback ) );

    return result;

  });

};

/* EXPORT */

export default forIndex;
