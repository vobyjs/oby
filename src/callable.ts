
/* IMPORT */

import {SYMBOL} from './constants';
import {setPrototypeOf} from './utils';

/* READABLE */

function readableFunction ( arg ) {
  if ( arg === SYMBOL ) return this;
  return this.get ();
}

const readablePrototype = {
  [SYMBOL]: true,
  get () {
    return this ( SYMBOL ).get ();
  },
  sample () {
    return this ( SYMBOL ).sample ();
  },
  select ( fn ) {
    return this ( SYMBOL ).select ( fn );
  },
  emit () {
    return this ( SYMBOL ).emit ();
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
  if ( arguments.length ) return this.set ( arg );
  return this.get ();
}

const writablePrototype = {
  ...readablePrototype,
  set ( value ) {
    return this ( SYMBOL ).set ( value );
  },
  produce ( fn ) {
    return this ( SYMBOL ).produce ( fn );
  },
  update ( fn ) {
    return this ( SYMBOL ).update ( fn );
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
