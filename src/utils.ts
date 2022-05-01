
/* MAIN */

const castError = ( error: unknown ): Error => {

  if ( isError ( error ) ) return error;

  if ( isString ( error ) ) return new Error ( error );

  return new Error ( 'Unknown error' );

};

const {isArray} = Array;

const isError = ( value: unknown ): value is Error => {

  return value instanceof Error;

};

const isFunction = ( value: unknown ): value is (( ...args: unknown[] ) => unknown) => {

  return typeof value === 'function';

};

const isString = ( value: unknown ): value is string => {

  return typeof value === 'string';

};

const max = <T extends number, U extends number> ( a: T, b: U ): T | U => {

  return Math.max ( a, b ) as T | U; //TSC

};

/* EXPORT */

export {castError, isArray, isError, isFunction, isString, max};
