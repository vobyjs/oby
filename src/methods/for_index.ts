
/* IMPORT */

import forAbstract from '~/methods/for_abstract';
import Cache from '~/methods/for_index.cache';
import type {MapIndexFunction, ObservableReadonly, FunctionMaybe, Indexed, Resolved} from '~/types';

/* MAIN */

const forIndex = <T, R, F> ( values: FunctionMaybe<readonly T[]>, fn: MapIndexFunction<Indexed<T>, R>, fallback: F | [] = [] ): ObservableReadonly<Resolved<R>[] | Resolved<F>> => {

  return forAbstract ( Cache, values, fn, fallback );

};

/* EXPORT */

export default forIndex;
