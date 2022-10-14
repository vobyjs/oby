
/* IMPORT */

import {OWNER} from '~/constants';

/* MAIN */

function context <T> ( symbol: symbol ): T | undefined;
function context <T> ( symbol: symbol, value: T ): undefined;
function context <T> ( symbol: symbol, value?: T ) {

  if ( arguments.length < 2 ) {

    return OWNER.current.read<T> ( symbol );

  } else {

    return OWNER.current.write ( symbol, value );

  }

}

/* EXPORT */

export default context;
