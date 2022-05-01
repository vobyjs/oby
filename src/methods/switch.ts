
/* IMPORT */

import computed from '~/methods/computed';
import resolve from '~/methods/resolve';
import {isFunction} from '~/utils';
import type {ObservableReadonly, FunctionMaybe, Resolved} from '~/types';

/* MAIN */

function _switch <T, R> ( when: FunctionMaybe<T>, values: [...[T, R][], [R]] ): ObservableReadonly<Resolved<R>>;
function _switch <T, R> ( when: FunctionMaybe<T>, values: [T, R][] ): ObservableReadonly<Resolved<R | undefined>>;
function _switch <T, R> ( when: FunctionMaybe<T>, values: ([T, R] | [R])[] ): ObservableReadonly<Resolved<R | undefined>> {

  const value = computed ( () => {

    const condition = isFunction ( when ) ? when () : when;

    for ( let i = 0, l = values.length; i < l; i++ ) {

      const value = values[i];

      if ( value.length === 1 ) return value[0];

      if ( Object.is ( value[0], condition ) ) return value[1];

    }

  });

  return computed ( () => {

    return resolve ( value () );

  });

};

/* EXPORT */

export default _switch;
