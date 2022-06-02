
/* IMPORT */

import {SYMBOL_OBSERVABLE, SYMBOL_OBSERVABLE_FROZEN, SYMBOL_OBSERVABLE_READABLE, SYMBOL_OBSERVABLE_WRITABLE} from '~/constants';
import {isFunction} from '~/utils';
import type {IObservable, UpdateFunction, Frozen, Readable, Writable} from '~/types';

/* HELPERS */

const {bind, prototype} = Function;
const {setPrototypeOf} = Object;

/* MAIN */

function frozenFunction <T> ( this: T, symbol: symbol ): T;
function frozenFunction <T> ( this: T, symbol?: symbol ): T {
  if ( arguments.length ) throw new Error ( 'A readonly Observable can not be updated' );
  return this;
}

function readableFunction <T> ( this: IObservable<T>, symbol: symbol ): IObservable<T>;
function readableFunction <T> ( this: IObservable<T>, symbol?: symbol ): T | IObservable<T> {
  if ( arguments.length ) {
    if ( symbol === SYMBOL_OBSERVABLE ) return this;
    throw new Error ( 'A readonly Observable can not be updated' );
  }
  return this.read ();
}

function writableFunction <T> ( this: IObservable<T>, symbol: symbol ): IObservable<T>;
function writableFunction <T> ( this: IObservable<T>, fn?: UpdateFunction<T> | T | symbol ): T | IObservable<T> {
  if ( arguments.length ) {
    if ( fn === SYMBOL_OBSERVABLE ) return this;
    if ( isFunction ( fn ) ) return this.update ( fn as UpdateFunction<T> ); //TSC
    return this.write ( fn as T ); //TSC
  }
  return this.read ();
}

const frozenPrototype = setPrototypeOf ( { [SYMBOL_OBSERVABLE]: true, [SYMBOL_OBSERVABLE_FROZEN]: true }, prototype );
const readablePrototype = setPrototypeOf ( { [SYMBOL_OBSERVABLE]: true, [SYMBOL_OBSERVABLE_READABLE]: true }, prototype );
const writablePrototype = setPrototypeOf ( { [SYMBOL_OBSERVABLE]: true, [SYMBOL_OBSERVABLE_WRITABLE]: true }, prototype );

setPrototypeOf ( frozenFunction, frozenPrototype );
setPrototypeOf ( readableFunction, readablePrototype );
setPrototypeOf ( writableFunction, writablePrototype );

const frozen = bind.bind ( frozenFunction as any ) as Frozen; //TSC
const readable = bind.bind ( readableFunction as any ) as Readable; //TSC
const writable = bind.bind ( writableFunction as any ) as Writable; //TSC

/* EXPORT */

export {frozen, readable, writable};
