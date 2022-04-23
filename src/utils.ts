
/* MAIN */

const castError = ( exception: unknown ): Error => {

  if ( exception instanceof Error ) return exception;

  if ( typeof exception === 'string' ) return new Error ( exception );

  return new Error ( 'Unknown error' );

};

/* EXPORT */

export {castError};
