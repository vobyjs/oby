
/* IMPORT */

import {OWNER} from '~/context';

/* MAIN */

function context <T> ( symbol: symbol ): T | undefined;
function context <T> ( symbol: symbol, value: T ): undefined;
function context <T> ( symbol: symbol, value?: T ) {

  if ( arguments.length < 2 ) {

    return OWNER.get<T> ( symbol );

  } else {

    return OWNER.set ( symbol, value );

  }

}

/* EXPORT */

export default context;
