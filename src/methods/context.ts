
/* IMPORT */

import {OWNER} from '~/constants';

/* MAIN */

function context <T> ( symbol: symbol ): T | undefined;
function context <T> ( symbol: symbol, value: T ): undefined;
function context <T> ( symbol: symbol, value?: T ) {

  if ( arguments.length < 2 ) { // Read

    return OWNER.current.context<T> ( symbol );

  } else { // Write

    return OWNER.current.registerContext ( symbol, value );

  }

}

/* EXPORT */

export default context;
