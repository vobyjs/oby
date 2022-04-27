
/* IMPORT */

import {SYMBOL} from '~/constants';
import {isFunction} from '~/utils';
import type {IObservable, UpdateFunction, Readable, Writable} from '~/types';

/* HELPERS */

const {bind, prototype} = Function;
const {setPrototypeOf} = Object;
const proto = setPrototypeOf ( { [SYMBOL]: true }, prototype );

/* MAIN */

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

setPrototypeOf ( readableFunction, proto );
setPrototypeOf ( writableFunction, proto );

const readable = bind.bind ( readableFunction as any ) as Readable; //TSC
const writable = bind.bind ( writableFunction as any ) as Writable; //TSC

/* EXPORT */

export {readable, writable};
