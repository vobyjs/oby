
/* IMPORT */

import isObservable from '~/methods/is_observable';
import {isFunction} from '~/utils';
import type {ObservableReadonly} from '~/types';

/* MAIN */

function get <T> ( value: T, getFunction?: true ): T extends (() => infer U) ? U : T;
function get <T> ( value: T, getFunction: false ): T extends ObservableReadonly<infer U> ? U : T;
function get <T> ( value: T, getFunction: boolean = true ) {

  const is = getFunction ? isFunction : isObservable;

  if ( is ( value ) ) return value ();

  return value;

}

/* EXPORT */

export default get;
