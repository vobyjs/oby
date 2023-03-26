
/* IMPORT */

import forAbstract from '~/methods/for_abstract';
import Cache from '~/methods/for_value.cache';
import type {MapValueFunction, ObservableReadonly, FunctionMaybe, Resolved} from '~/types';

/* MAIN */

const forValue = <T, R, F> ( values: FunctionMaybe<readonly T[]>, fn: MapValueFunction<T, R>, fallback: F | [] = [] ): ObservableReadonly<Resolved<R>[] | Resolved<F>> => {

  return forAbstract ( Cache, values, fn, fallback );

};

/* EXPORT */

export default forValue;

//TODO: REVIEW
