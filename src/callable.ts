
/* IMPORT */

import Observable from './observable';
import symbol from './symbol';

/* HELPERS */

const {setPrototypeOf} = Object;

/* READABLE */

function readableFunction ( arg ) {
  if ( arg === symbol ) return this;
  return Observable.get ( this );
}

const readablePrototype = {
  [symbol]: true,
  get () {
    return Observable.get ( this ( symbol ) );
  },
  sample () {
    return Observable.sample ( this ( symbol ) );
  },
  select ( fn ) {
    return Observable.select ( this ( symbol ), fn );
  },
  readonly () {
    return this;
  },
  isReadonly () {
    return true;
  }
};

setPrototypeOf ( readableFunction, setPrototypeOf ( readablePrototype, Function.prototype ) );

const readable = readableFunction.bind.bind ( readableFunction );

/* WRITABLE */

function writableFunction ( arg ) {
  if ( arg === symbol ) return this;
  if ( arguments.length ) return Observable.set ( this, arg );
  return Observable.get ( this );
}

const writablePrototype = {
  ...readablePrototype,
  set ( value ) {
    return Observable.set ( this ( symbol ), value );
  },
  produce ( fn ) {
    return Observable.produce ( this ( symbol ), fn );
  },
  update ( fn ) {
    return Observable.update ( this ( symbol ), fn );
  },
  emit () {
    return Observable.emit ( this ( symbol ), true );
  },
  readonly () {
    return readable ( this ( symbol ) );
  },
  isReadonly () {
    return false;
  }
};

setPrototypeOf ( writableFunction, setPrototypeOf ( writablePrototype, Function.prototype ) );

const writable = writableFunction.bind.bind ( writableFunction );

/* EXPORT */

export {readable, writable};
