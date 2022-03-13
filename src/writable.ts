
/* IMPORT */

import {SYMBOL} from './constants';
import readable from './readable';

/* MAIN */

const writable = (() => {

  function writable ( arg ) {
    if ( arg === SYMBOL ) return this;
    if ( arguments.length ) return this.set ( arg );
    return this.get ();
  }

  const prototype = {
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
    set ( value ) {
      return this ( SYMBOL ).set ( value );
    },
    produce ( fn ) {
      return this ( SYMBOL ).produce ( fn );
    },
    update ( fn ) {
      return this ( SYMBOL ).update ( fn );
    },
    emit () {
      return this ( SYMBOL ).emit ();
    },
    readonly () {
      return readable ( this ( SYMBOL ) );
    },
    isReadonly () {
      return false;
    }
  };

  Object.setPrototypeOf ( writable, Object.setPrototypeOf ( prototype, Function.prototype ) );

  return writable.bind.bind ( writable );

})();

/* EXPORT */

export default writable;
