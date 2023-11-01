
/* IMPORT */

import get from '~/methods/get';
import isObservableBoolean from '~/methods/is_observable_boolean';
import isObservableFrozen from '~/methods/is_observable_frozen';
import isUntracked from '~/methods/is_untracked';
import memo from '~/methods/memo';
import resolve from '~/methods/resolve';
import warmup from '~/methods/warmup';
import {frozen} from '~/objects/callable';
import {is, isFunction} from '~/utils';
import type {ObservableReadonly, FunctionMaybe, Resolved} from '~/types';

/* HELPERS */

const match = <T, R, F> ( condition: T, values: ([T, R] | [R])[], fallback?: F ): R | F | undefined => {

  for ( let i = 0, l = values.length; i < l; i++ ) {

    const value = values[i];

    if ( value.length === 1 ) return value[0];

    if ( is ( value[0], condition ) ) return value[1];

  }

  return fallback;

};

/* MAIN */

function _switch <T, R> ( when: FunctionMaybe<T>, values: [...[T, R][], [R]], fallback?: undefined ): ObservableReadonly<Resolved<R>>;
function _switch <T, R, F> ( when: FunctionMaybe<T>, values: [...[T, R][], [R]], fallback: F ): ObservableReadonly<Resolved<R>>;
function _switch <T, R> ( when: FunctionMaybe<T>, values: [T, R][], fallback?: undefined ): ObservableReadonly<Resolved<R | undefined>>;
function _switch <T, R, F> ( when: FunctionMaybe<T>, values: [T, R][], fallback: F ): ObservableReadonly<Resolved<R | F>>;
function _switch <T, R, F> ( when: FunctionMaybe<T>, values: ([T, R] | [R])[], fallback?: F ): ObservableReadonly<Resolved<R | F | undefined>> {

  const isDynamic = isFunction ( when ) && !isObservableFrozen ( when ) && !isUntracked ( when );

  if ( isDynamic ) {

    if ( isObservableBoolean ( when ) ) {

      return memo ( () => resolve ( match ( when (), values, fallback ) ) );

    }

    const value = warmup ( memo ( () => match ( when (), values, fallback ) ) );

    if ( isObservableFrozen ( value ) ) {

      return frozen ( resolve ( value () ) );

    } else {

      return memo ( () => resolve ( get ( value ) ) );

    }

  } else {

    const value = match ( get ( when ), values, fallback );

    return frozen ( resolve ( value ) );

  }

}

/* EXPORT */

export default _switch;
