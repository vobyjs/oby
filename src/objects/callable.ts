
/* IMPORT */

import {SYMBOL_OBSERVABLE, SYMBOL_OBSERVABLE_FROZEN, SYMBOL_OBSERVABLE_READABLE, SYMBOL_OBSERVABLE_WRITABLE} from '~/symbols';
import {isFunction} from '~/utils';
import type {IObservable, UpdateFunction, Observable, ObservableReadonly} from '~/types';

/* MAIN - FUNCTIONS */

function frozenFunction <T> ( this: T ): T {
  if ( arguments.length ) {
    throw new Error ( 'A readonly Observable can not be updated' );
  } else {
    return this;
  }
}

function readableFunction <T> ( this: IObservable<T> ): T {
  if ( arguments.length ) {
    throw new Error ( 'A readonly Observable can not be updated' );
  } else {
    return this.get ();
  }
}

function writableFunction <T> ( this: IObservable<T>, fn?: UpdateFunction<T> | T ): T {
  if ( arguments.length ) {
    if ( isFunction ( fn ) ) {
      return this.update ( fn );
    } else {
      return this.set ( fn! ); //TSC
    }
  } else {
    return this.get ();
  }
}

/* MAIN - GENERATORS */

const frozen = <T> ( value: T ): ObservableReadonly<T> => {
  const fn = frozenFunction.bind ( value ) as ObservableReadonly<T>; //TSC
  fn[SYMBOL_OBSERVABLE] = true;
  fn[SYMBOL_OBSERVABLE_FROZEN] = true;
  return fn;
};

const readable = <T> ( value: IObservable<T> ): ObservableReadonly<T> => {
  //TODO: Make a frozen one instead if disposed
  const fn = readableFunction.bind ( value as any ) as ObservableReadonly<T>; //TSC
  fn[SYMBOL_OBSERVABLE] = true;
  fn[SYMBOL_OBSERVABLE_READABLE] = value;
  return fn;
};

const writable = <T> ( value: IObservable<T> ): Observable<T> => {
  const fn = writableFunction.bind ( value as any ) as ObservableReadonly<T>; //TSC
  fn[SYMBOL_OBSERVABLE] = true;
  fn[SYMBOL_OBSERVABLE_WRITABLE] = value;
  return fn;
};

/* EXPORT */

export {frozen, readable, writable};
