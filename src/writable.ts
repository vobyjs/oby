
/* IMPORT */

import {SYMBOL} from './constants';

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
    set ( value ) {
      return this ( SYMBOL ).set ( value );
    },
    produce ( fn ) {
      return this ( SYMBOL ).produce ( fn );
    },
    update ( fn ) {
      return this ( SYMBOL ).update ( fn );
    }
  };

  Object.setPrototypeOf ( writable, Object.setPrototypeOf ( prototype, Function.prototype ) );

  return writable.bind.bind ( writable );

})();

/* EXPORT */

export default writable;
