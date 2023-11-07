
/* MAIN */

const castError = ( error: unknown ): Error => {

  if ( error instanceof Error ) return error;

  if ( typeof error === 'string' ) return new Error ( error );

  return new Error ( 'Unknown error' );

};

const {is} = Object;

const isFunction = ( value: unknown ): value is Function => {

  return typeof value === 'function';

};

const isObject = ( value: unknown ): value is Record<number | string | symbol, unknown> => {

  return ( value !== null ) && ( typeof value === 'object' );

};

const isSymbol = ( value: unknown ): value is symbol => {

  return typeof value === 'symbol';

};

const noop = (): void => {

  return;

};

const nope = (): false => {

  return false;

};

const yep = (): true => {

  return true;

};

/* EXPORT */

export {castError, is, isFunction, isObject, isSymbol, noop, nope, yep};
