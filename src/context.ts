
/* IMPORT */

import Owner from './owner';

/* MAIN */

function context <T> ( symbol: symbol ): T | undefined;
function context <T> ( symbol: symbol, value: T ): T;
function context <T> ( symbol: symbol, value?: T ) {

  const observer = Owner.get ();

  if ( !observer ) throw new Error ( 'Invalid context call, no parent computation found' );

  if ( arguments.length === 1 ) { // Read

    return observer.updateContext ( symbol );

  } else { // Write

    return observer.registerContext ( symbol, value );

  }

}

/* EXPORT */

export default context;
