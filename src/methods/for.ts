
/* IMPORT */

import cleanup from '~/methods/cleanup';
import computed from '~/methods/computed';
import Cache from '~/methods/for.cache';
import {isFunction} from '~/utils';
import type {MapFunction, ObservableReadonly, FunctionMaybe, Resolved} from '~/types';

/* MAIN */

const _for = <T, R> ( values: FunctionMaybe<T[]>, fn: MapFunction<T, R> ): ObservableReadonly<Resolved<R>[]> => {

  const cache = new Cache ( fn );
  const {dispose, before, after, map} = cache;

  cleanup ( dispose );

  return computed ( () => {

    const array = isFunction ( values ) ? values () : values;

    before ( array );

    const result = array.map ( map );

    after ( array );

    return result;

  });

};

/* EXPORT */

export default _for;
