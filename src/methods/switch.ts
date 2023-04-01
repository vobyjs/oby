
/* IMPORT */

import {OBSERVABLE_UNDEFINED} from '~/constants';
import get from '~/methods/get';
import isObservableFrozen from '~/methods/is_observable_frozen';
import memo from '~/methods/memo';
import resolve from '~/methods/resolve';
import untrack from '~/methods/untrack';
import warmup from '~/methods/warmup';
import {is} from '~/utils';
import type {ObservableReadonly, FunctionMaybe, Resolved} from '~/types';

/* MAIN */

function _switch <T, R> ( when: FunctionMaybe<T>, values: [...[T, R][], [R]], fallback?: undefined ): ObservableReadonly<Resolved<R>>;
function _switch <T, R, F> ( when: FunctionMaybe<T>, values: [...[T, R][], [R]], fallback: F ): ObservableReadonly<Resolved<R>>;
function _switch <T, R> ( when: FunctionMaybe<T>, values: [T, R][], fallback?: undefined ): ObservableReadonly<Resolved<R | undefined>>;
function _switch <T, R, F> ( when: FunctionMaybe<T>, values: [T, R][], fallback: F ): ObservableReadonly<Resolved<R | F>>;
function _switch <T, R, F> ( when: FunctionMaybe<T>, values: ([T, R] | [R])[], fallback?: F ): ObservableReadonly<Resolved<R | F | undefined>> {

  const value = warmup ( memo ( () => {

    const condition = get ( when );

    for ( let i = 0, l = values.length; i < l; i++ ) {

      const value = values[i];

      if ( value.length === 1 ) return value[0];

      if ( is ( value[0], condition ) ) return value[1];

    }

    return fallback;

  }));

  if ( isObservableFrozen ( value ) ) {

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
