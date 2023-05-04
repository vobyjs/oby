
/* IMPORT */

import {OBSERVABLE_UNDEFINED} from '~/constants';
import get from '~/methods/get';
import isObservable from '~/methods/is_observable';
import isObservableFrozen from '~/methods/is_observable_frozen';
import memo from '~/methods/memo';
import resolve from '~/methods/resolve';
import untrack from '~/methods/untrack';
import warmup from '~/methods/warmup';
import {frozen} from '~/objects/callable';
import {is, isArray, isFunction} from '~/utils';
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

  const value = isFunction ( when ) ? warmup ( memo ( () => match ( when (), values, fallback ) ) ) : match ( when, values, fallback );

  if ( !isFunction ( value ) && !isArray ( value ) ) {

    return frozen ( value );

  } else if ( !isObservable ( value ) ) {

    return memo ( () => {

      return resolve ( value );

    });

  } else if ( isObservableFrozen ( value ) ) {

    const valueUnwrapped = untrack ( value );

    if ( valueUnwrapped === undefined ) {

      return OBSERVABLE_UNDEFINED;

    } else {

      return memo ( () => {

        return resolve ( valueUnwrapped );

      });

    }

  } else {

    return memo ( () => {

      return resolve ( get ( value ) );

    });

  }

}

/* EXPORT */

export default _switch;
