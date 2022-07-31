
/* IMPORT */

import {IS, SYMBOL_OBSERVABLE_FROZEN} from '~/constants';
import get from '~/methods/get';
import memo from '~/methods/memo';
import resolve from '~/methods/resolve';
import resolved from '~/methods/resolved';
import {isFunction} from '~/utils';
import type {ObservableReadonly, FunctionMaybe, Resolved} from '~/types';

/* HELPERS */

const find = <T, R> ( values: ([T, R] | [R])[], condition: T ): R | undefined => {

  for ( let i = 0, l = values.length; i < l; i++ ) {

    const value = values[i];

    if ( value.length === 1 ) return value[0];

    if ( IS ( value[0], condition ) ) return value[1];

  }

};

/* MAIN */

function _switch <T, R> ( when: FunctionMaybe<T>, values: [...[T, R][], [R]] ): ObservableReadonly<Resolved<R>>;
function _switch <T, R> ( when: FunctionMaybe<T>, values: [T, R][] ): ObservableReadonly<Resolved<R | undefined>>;
function _switch <T, R> ( when: FunctionMaybe<T>, values: ([T, R] | [R])[] ): ObservableReadonly<Resolved<R | undefined>> {

  if ( isFunction ( when ) && !( SYMBOL_OBSERVABLE_FROZEN in when ) ) {

    const value = memo ( () => {

      return find ( values, get ( when ) );

    });

    return memo ( () => {

      return resolve ( value () );

    });

  } else {

    return resolved ( find ( values, get ( when ) ) );

  }

};

/* EXPORT */

export default _switch;
