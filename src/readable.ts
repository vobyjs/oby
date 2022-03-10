
/* IMPORT */

import {SYMBOL} from './constants';

/* MAIN */

const readable = (() => {

  function readable ( arg ) {
    if ( arg === SYMBOL ) return this;
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
    readonly () {
      return this;
    },
    isReadonly () {
      return true;
    }
  };

  Object.setPrototypeOf ( readable, Object.setPrototypeOf ( prototype, Function.prototype ) );

  return readable.bind.bind ( readable );

})();

/* EXPORT */

export default readable;
