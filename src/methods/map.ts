
/* IMPORT */

import cleanup from '~/methods/cleanup';
import computed from '~/methods/computed';
import Cache from '~/methods/map.cache';
import type {MapFunction, ObservableReadonly, Resolved} from '~/types';

/* MAIN */

const map = <T, R> ( values: T[] | (() => T[]), fn: MapFunction<T, R>): ObservableReadonly<Resolved<R>[]> | Resolved<R>[] => {

  if ( typeof values === 'function' ) {

    const cache = new Cache ( fn );
    const {dispose, before, after, map} = cache;

    cleanup ( dispose );

    return computed ( () => {

      const array = values ();

      before ( array );

      const result = array.map ( map );

      after ( array );

      return result;

    });

  } else {

    return values.map ( fn );

  }

};

/* EXPORT */

export default map;
