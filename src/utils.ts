
/* HELPERS */

const {toString} = Object.prototype;

/* MAIN */

const castError = ( error: unknown ): Error => {

  if ( error instanceof Error ) return error;

  if ( typeof error === 'string' ) return new Error ( error );

  return new Error ( 'Unknown error' );

};

const {isArray} = Array;

const isFunction = ( value: unknown ): value is (( ...args: unknown[] ) => unknown) => {

  return typeof value === 'function';

};

const isFunctionAsync = ( value: Function ): boolean => {

  return toString.call ( value ) === '[object AsyncFunction]';

};

const isNumber = ( value: unknown ): boolean => {

  return typeof value === 'number';

};

const isObject = ( value: unknown ): value is Record<number | string | symbol, unknown> => {

  return ( value !== null ) && ( typeof value === 'object' );

};

const max = <T extends number, U extends number> ( a: T, b: U ): T | U => {

  return Math.max ( a, b ) as T | U; //TSC

};

/* EXPORT */

export {castError, isArray, isFunction, isFunctionAsync, isNumber, isObject, max};
