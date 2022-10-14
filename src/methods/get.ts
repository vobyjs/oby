
/* IMPORT */

import isObservable from '~/methods/is_observable';
import {isFunction} from '~/utils';
import type {FunctionMaybe, ObservableReadonly} from '~/types';

/* MAIN */

function get <T> ( value: FunctionMaybe<T>, getFunction?: true ): T;
function get <T> ( value: T, getFunction: false ): T extends ObservableReadonly<infer U> ? U : T;
function get <T> ( value: T, getFunction: boolean = true ) {

  const is = getFunction ? isFunction : isObservable;

  if ( is ( value ) ) {

    return value ();

  } else {

    return value;

  }

}

/* EXPORT */

export default get;
