
/* IMPORT */

import {SYMBOL} from '~/constants';
import {isFunction} from '~/utils';
import type {IObservable, UpdateFunction, Frozen, Readable, Writable} from '~/types';

/* HELPERS */

const {bind, prototype} = Function;
const {setPrototypeOf} = Object;
const proto = setPrototypeOf ( { [SYMBOL]: true }, prototype );

/* MAIN */

function frozenFunction <T> ( this: T ): T {
  if ( arguments.length ) throw new Error ( 'A readonly Observable can not be updated' );
  return this;
}

function readableFunction <T> ( this: IObservable<T> ): T {
  if ( arguments.length ) throw new Error ( 'A readonly Observable can not be updated' );
  return this.read ();
}

function writableFunction <T> ( this: IObservable<T>, fn?: UpdateFunction<T> | T ): T {
  if ( arguments.length ) {
    if ( isFunction ( fn ) ) return this.update ( fn as UpdateFunction<T> ); //TSC
    return this.write ( fn as T ); //TSC
  }
  return this.read ();
}

setPrototypeOf ( frozenFunction, proto );
setPrototypeOf ( readableFunction, proto );
setPrototypeOf ( writableFunction, proto );

const frozen = bind.bind ( frozenFunction as any ) as Frozen; //TSC
const readable = bind.bind ( readableFunction as any ) as Readable; //TSC
const writable = bind.bind ( writableFunction as any ) as Writable; //TSC

/* EXPORT */

export {frozen, readable, writable};
