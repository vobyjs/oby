
/* IMPORT */

import Owner from './owner';
import {ContextToken} from './types';

/* MAIN */

function context <T> ( token: ContextToken<T> ): T | undefined;
function context <T> ( value: T ): ContextToken<T>;
function context <T> ( value: T | ContextToken<T> ) {

  const observer = Owner.get ();

  if ( !observer ) throw new Error ( 'Invalid context call, no parent computation found' );

  if ( 'symbol' in value && 'default' in value ) { // Read

    return observer.updateContext ( value );

  } else { // Write

    return observer.registerContext ( value );

  }

};

/* EXPORT */

export default context;
