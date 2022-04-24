
/* IMPORT */

import computed from '~/methods/computed';
import resolve from '~/methods/resolve';
import type {ObservableReadonly, FunctionMaybe, Resolved} from '~/types';

/* MAIN */

const _switch = <T, R> ( when: FunctionMaybe<T>, values: ([T, R] | [R])[] ): ObservableReadonly<Resolved<R | undefined>> => {

  return computed ( () => {

    const condition = resolve ( when );

    for ( let i = 0, l = values.length; i < l; i++ ) {

      const value = values[i];

      if ( value.length === 1 ) return resolve ( value[0] );

      if ( value[0] === condition ) return resolve ( value[1] );

    }

  });

};

/* EXPORT */

export default _switch;
