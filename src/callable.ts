
/* IMPORT */

import {SYMBOL} from '~/constants';
import type {IObservable, SelectFunction, ProduceFunction, UpdateFunction, ObservableReadonlyAbstract, Accessor, Readable, Writable} from '~/types';

/* HELPERS */

const {prototype} = Function;
const {setPrototypeOf} = Object;

/* READABLE */

function readableFunction <T, TI> ( this: IObservable<T, TI> ): T | TI;
function readableFunction <T, TI> ( this: IObservable<T, TI>, arg: symbol ): IObservable<T, TI>;
function readableFunction <T, TI> ( this: IObservable<T, TI>, arg?: symbol ) {
  if ( arg === SYMBOL ) return this;
  return this.get ();
}

const readablePrototype = {
  [SYMBOL]: true,
  get <T, TI> ( this: Accessor<T, TI> ): T | TI {
    return this ( SYMBOL ).get ();
  },
  sample <T, TI> ( this: Accessor<T, TI> ): T | TI {
    return this ( SYMBOL ).sample ();
  },
  select <T, TI, R> ( this: Accessor<T, TI>, fn: SelectFunction<T | TI, R> ): ObservableReadonlyAbstract<R, R> {
    return this ( SYMBOL ).select ( fn );
  },
  readonly <T, TI> ( this: Accessor<T, TI> ): ObservableReadonlyAbstract<T, TI> {
    return this as any; //TSC
  },
  isReadonly <T, TI> ( this: Accessor<T, TI> ): true {
    return true;
  }
};

setPrototypeOf ( readableFunction, setPrototypeOf ( readablePrototype, prototype ) );

const readable = readableFunction.bind.bind ( readableFunction as any ) as Readable; //TSC

/* WRITABLE */

function writableFunction <T, TI> ( this: IObservable<T, TI> ): T | TI;
function writableFunction <T, TI> ( this: IObservable<T, TI>, arg: symbol ): IObservable<T, TI>;
function writableFunction <T, TI> ( this: IObservable<T, TI>, arg: T ): T;
function writableFunction <T, TI> ( this: IObservable<T, TI>, arg?: symbol | T ) {
  if ( arg === SYMBOL ) return this;
  if ( arguments.length ) return this.set ( arg as T ); //TSC
  return this.get ();
}

const writablePrototype = {
  ...readablePrototype,
  set <T, TI> ( this: Accessor<T, TI>, value: T ): T {
    return this ( SYMBOL ).set ( value );
  },
  produce <T, TI> ( this: Accessor<T, TI>, fn: ProduceFunction<T | TI, T> ): T {
    return this ( SYMBOL ).produce ( fn );
  },
  update <T, TI> ( this: Accessor<T, TI>, fn: UpdateFunction<T | TI, T> ): T {
    return this ( SYMBOL ).update ( fn );
  },
  readonly <T, TI> ( this: Accessor<T, TI> ): ObservableReadonlyAbstract<T, TI> {
    return this ( SYMBOL ).readable ();
  },
  isReadonly <T, TI> ( this: Accessor<T, TI> ): false {
    return false;
  }
};

setPrototypeOf ( writableFunction, setPrototypeOf ( writablePrototype, prototype ) );

const writable = writableFunction.bind.bind ( writableFunction as any ) as Writable; //TSC

/* EXPORT */

export {readable, writable};
