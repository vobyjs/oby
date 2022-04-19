
/* IMPORT */

import Observable from './observable';
import symbol from './symbol';
import type {ProduceFunction, SelectFunction, UpdateFunction, PlainObservable, ObservableReadonlyAbstract, Accessor, Readable, Writable} from './types';

/* HELPERS */

const {prototype} = Function;
const {setPrototypeOf} = Object;

/* READABLE */

function readableFunction <T, TI> ( this: PlainObservable<T, TI> ): T | TI;
function readableFunction <T, TI> ( this: PlainObservable<T, TI>, arg: symbol ): PlainObservable<T, TI>;
function readableFunction <T, TI> ( this: PlainObservable<T, TI>, arg?: symbol ) {
  if ( arg === symbol ) return this;
  return Observable.get ( this );
}

const readablePrototype = {
  [symbol]: true,
  get <T, TI> ( this: Accessor<T, TI> ): T | TI {
    return Observable.get ( this ( symbol ) );
  },
  sample <T, TI> ( this: Accessor<T, TI> ): T | TI {
    return Observable.sample ( this ( symbol ) );
  },
  select <T, TI, R> ( this: Accessor<T, TI>, fn: SelectFunction<T | TI, R> ): ObservableReadonlyAbstract<R, R> {
    return Observable.select ( this ( symbol ), fn );
  },
  readonly <T, TI> ( this: Accessor<T, TI> ): ObservableReadonlyAbstract<T, TI> {
    return this as any; //TSC
  },
  isReadonly <T, TI> ( this: Accessor<T, TI> ): true {
    return true;
  }
};

setPrototypeOf ( readableFunction, setPrototypeOf ( readablePrototype, prototype ) );

const readable: Readable = readableFunction.bind.bind ( readableFunction as any ) as Readable; //TSC

/* WRITABLE */

function writableFunction <T, TI> ( this: PlainObservable<T, TI> ): T | TI;
function writableFunction <T, TI> ( this: PlainObservable<T, TI>, arg: symbol ): PlainObservable<T, TI>;
function writableFunction <T, TI> ( this: PlainObservable<T, TI>, arg: T ): T;
function writableFunction <T, TI> ( this: PlainObservable<T, TI>, arg?: symbol | T ) {
  if ( arg === symbol ) return this;
  if ( arguments.length ) return Observable.set ( this as any, arg ); //TSC
  return Observable.get ( this );
}

const writablePrototype = {
  ...readablePrototype,
  set <T, TI> ( this: Accessor<T, TI>, value: T ): T {
    return Observable.set ( this ( symbol ), value );
  },
  produce <T, TI> ( this: Accessor<T, TI>, fn: ProduceFunction<T | TI, T> ): T {
    return Observable.produce ( this ( symbol ), fn );
  },
  update <T, TI> ( this: Accessor<T, TI>, fn: UpdateFunction<T | TI, T> ): T {
    return Observable.update ( this ( symbol ), fn );
  },
  emit <T, TI> ( this: Accessor<T, TI> ): void {
    return Observable.emit ( this ( symbol ), true );
  },
  readonly <T, TI> ( this: Accessor<T, TI> ): ObservableReadonlyAbstract<T, TI> {
    return readable ( this ( symbol ) );
  },
  isReadonly <T, TI> ( this: Accessor<T, TI> ): false {
    return false;
  }
};

setPrototypeOf ( writableFunction, setPrototypeOf ( writablePrototype, prototype ) );

const writable = writableFunction.bind.bind ( writableFunction as any ) as Writable; //TSC

/* EXPORT */

export {readable, writable};
