
/* IMPORT */

import {IS, SYMBOL_OBSERVABLE_FROZEN} from '~/constants';
import get from '~/methods/get';
import memo from '~/methods/memo';
import resolve from '~/methods/resolve';
import resolved from '~/methods/resolved';
import {isFunction} from '~/utils';
import type {ObservableReadonly, FunctionMaybe, Resolved} from '~/types';

/* HELPERS */

const find = <T, R, F> ( values: ([T, R] | [R])[], fallback: F | undefined, condition: T ): R | F | undefined => {

  for ( let i = 0, l = values.length; i < l; i++ ) {

    const value = values[i];

    if ( value.length === 1 ) return value[0];

    if ( IS ( value[0], condition ) ) return value[1];

  }

  return fallback;

};

/* MAIN */

function _switch <T, R> ( when: FunctionMaybe<T>, values: [...[T, R][], [R]], fallback?: undefined ): ObservableReadonly<Resolved<R>>;
function _switch <T, R, F> ( when: FunctionMaybe<T>, values: [...[T, R][], [R]], fallback: F ): ObservableReadonly<Resolved<R>>;
function _switch <T, R> ( when: FunctionMaybe<T>, values: [T, R][], fallback?: undefined ): ObservableReadonly<Resolved<R | undefined>>;
function _switch <T, R, F> ( when: FunctionMaybe<T>, values: [T, R][], fallback: F ): ObservableReadonly<Resolved<R | F>>;
function _switch <T, R, F> ( when: FunctionMaybe<T>, values: ([T, R] | [R])[], fallback?: F ): ObservableReadonly<Resolved<R | F | undefined>> {

  if ( isFunction ( when ) && !( SYMBOL_OBSERVABLE_FROZEN in when ) ) {

    const value = memo ( () => {

      return find ( values, fallback, get ( when ) );

    });

    return memo ( () => {

      return resolve ( value () );

    });

  } else {

    return resolved ( find ( values, fallback, get ( when ) ) );

  }

};

/* EXPORT */

export default _switch;
