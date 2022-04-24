
/* MAIN */

const castError = ( exception: unknown ): Error => {

  if ( exception instanceof Error ) return exception;

  if ( typeof exception === 'string' ) return new Error ( exception );

  return new Error ( 'Unknown error' );

};

const {isArray} = Array;

const isFunction = ( value: unknown ): value is (( ...args: unknown[] ) => unknown) => {

  return typeof value === 'function';

};

/* EXPORT */

export {castError, isArray, isFunction};
