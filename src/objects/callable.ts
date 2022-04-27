
/* IMPORT */

import {SYMBOL} from '~/constants';
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
  if ( arguments.length ) return this.write ( fn! );
  return this.read ();
}

setPrototypeOf ( readableFunction, proto );
setPrototypeOf ( writableFunction, proto );

const readable = bind.bind ( readableFunction as any ) as Readable; //TSC
const writable = bind.bind ( writableFunction as any ) as Writable; //TSC

/* EXPORT */

export {readable, writable};
