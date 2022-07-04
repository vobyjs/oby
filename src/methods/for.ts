
/* IMPORT */

import forAbstract from '~/methods/for_abstract';
import Cache from '~/methods/for.cache';
import type {MapFunction, ObservableReadonly, FunctionMaybe, Resolved} from '~/types';

/* MAIN */

const _for = <T, R, F> ( values: FunctionMaybe<readonly T[]>, fn: MapFunction<T, R>, fallback: F | [] = [] ): ObservableReadonly<Resolved<R>[] | Resolved<F>> => {

  return forAbstract ( Cache, values, fn, fallback );

};

/* EXPORT */

export default _for;
