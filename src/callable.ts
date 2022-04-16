
/* IMPORT */

import {SYMBOL} from './constants';
import Observable from './observable';

/* HELPERS */

const {setPrototypeOf} = Object;

/* READABLE */

function readableFunction ( arg ) {
  if ( arg === SYMBOL ) return this;
  return Observable.get ( this );
}

const readablePrototype = {
  [SYMBOL]: true,
  get () {
    return Observable.get ( this ( SYMBOL ) );
  },
  sample () {
    return Observable.sample ( this ( SYMBOL ) );
  },
  select ( fn ) {
    return Observable.select ( this ( SYMBOL ), fn );
  },
  isDisposed () {
    return false;
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
  if ( arg === SYMBOL ) return this;
  if ( arguments.length ) return Observable.set ( this, arg );
  return Observable.get ( this );
}

const writablePrototype = {
  ...readablePrototype,
  set ( value ) {
    return Observable.set ( this ( SYMBOL ), value );
  },
  produce ( fn ) {
    return Observable.produce ( this ( SYMBOL ), fn );
  },
  update ( fn ) {
    return Observable.update ( this ( SYMBOL ), fn );
  },
  emit () {
    return Observable.emit ( this ( SYMBOL ), true );
  },
  dispose () {
    return Observable.dispose ( this ( SYMBOL ) );
  },
  isDisposed () {
    return this ( SYMBOL ).disposed;
  },
  readonly () {
    return readable ( this ( SYMBOL ) );
  },
  isReadonly () {
    return false;
  }
};

setPrototypeOf ( writableFunction, setPrototypeOf ( writablePrototype, Function.prototype ) );

const writable = writableFunction.bind.bind ( writableFunction );

/* EXPORT */

export {readable, writable};
