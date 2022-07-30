
/* IMPORT */

import {IS} from '~/constants';
import get from '~/methods/get';
import memo from '~/methods/memo';
import resolve from '~/methods/resolve';
import type {ObservableReadonly, FunctionMaybe, Resolved} from '~/types';

/* MAIN */

function _switch <T, R> ( when: FunctionMaybe<T>, values: [...[T, R][], [R]] ): ObservableReadonly<Resolved<R>>;
function _switch <T, R> ( when: FunctionMaybe<T>, values: [T, R][] ): ObservableReadonly<Resolved<R | undefined>>;
function _switch <T, R> ( when: FunctionMaybe<T>, values: ([T, R] | [R])[] ): ObservableReadonly<Resolved<R | undefined>> {

  const value = memo ( () => {

    const condition = get ( when );

    for ( let i = 0, l = values.length; i < l; i++ ) {

      const value = values[i];

      if ( value.length === 1 ) return value[0];

      if ( IS ( value[0], condition ) ) return value[1];

    }

  });

  return memo ( () => {

    return resolve ( value () );

  });

};

/* EXPORT */

export default _switch;
