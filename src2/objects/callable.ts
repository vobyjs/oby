
/* IMPORT */

import {FLAG_OBSERVABLE_TYPE_FROZEN, FLAG_OBSERVABLE_TYPE_READABLE, FLAG_OBSERVABLE_TYPE_WRITABLE} from '../constants';
import {observableGet, observableSet, observableUpdate} from '../objects/observable';
import {SYMBOL_OBSERVABLE} from '../symbols';
import {isFunction} from '../utils';
import type {UpdateFunction, ObservableState, Observable, ObservableReadonly} from '../types';

/* MAIN - FUNCTIONS */

function frozenFunction <T> ( this: T ): T {
  if ( arguments.length ) {
    throw new Error ( 'A readonly Observable can not be updated' );
  } else {
    return this;
  }
}

function readableFunction <T> ( this: ObservableState<T> ): T {
  if ( arguments.length ) {
    throw new Error ( 'A readonly Observable can not be updated' );
  } else {
    return observableGet ( this );
  }
}

function writableFunction <T> ( this: ObservableState<T>, fn?: UpdateFunction<T> | T ): T {
  if ( arguments.length ) {
    if ( isFunction ( fn ) ) {
      return observableUpdate ( this, fn );
    } else {
      return observableSet ( this, fn! ); //TSC
    }
  } else {
    return observableGet ( this );
  }
}

/* MAIN - ISTANTIATORS */

const frozen = <T> ( value: T ): ObservableReadonly<T> => {
  const fn = frozenFunction.bind ( value ) as ObservableReadonly<T>; //TSC
  fn[SYMBOL_OBSERVABLE] = FLAG_OBSERVABLE_TYPE_FROZEN;
  return fn;
};

const readable = <T> ( value: ObservableState<T> ): ObservableReadonly<T> => {
  //TODO: Make a frozen one instead if disposed
  const fn = readableFunction.bind ( value as any ) as ObservableReadonly<T>; //TSC
  fn[SYMBOL_OBSERVABLE] = FLAG_OBSERVABLE_TYPE_READABLE;
  return fn;
};

const writable = <T> ( value: ObservableState<T> ): Observable<T> => {
  const fn = writableFunction.bind ( value as any ) as ObservableReadonly<T>; //TSC
  fn[SYMBOL_OBSERVABLE] = FLAG_OBSERVABLE_TYPE_WRITABLE;
  return fn;
};

/* EXPORT */

export {frozen, readable, writable};
