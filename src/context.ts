
/* IMPORT */

import Observer from './observer';
import Owner from './owner';

/* MAIN */

function context <T> ( symbol: symbol ): T | undefined;
function context <T> ( symbol: symbol, value: T ): T;
function context <T> ( symbol: symbol, value?: T ) {

  const observer = Owner.get ();

  if ( arguments.length === 1 ) { // Read

    return Observer.context ( observer, symbol );

  } else { // Write

    return Observer.registerContext ( observer, symbol, value );

  }

}

/* EXPORT */

export default context;
