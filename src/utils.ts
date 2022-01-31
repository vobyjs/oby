
/* MAIN */

const cloneDeep = <T> ( value: T ): T => { //FIXME: This only works for JSON-serializable values, and it's slow at that too, it should be implemented properly

  return JSON.parse ( JSON.stringify ( value ) );

};

const {isArray} = Array;

const isFunction = ( value: unknown ): value is (( ...args: unknown[] ) => unknown) => {

  return typeof value === 'function';

};

const isPrimitive = ( value: unknown ): value is null | undefined | string | number | boolean | symbol | bigint => {

  if ( value === null ) return true;

  const type = typeof value;

  return type !== 'object' && type !== 'function';

};

const isSet = ( value: unknown ): value is Set<unknown> => {

  return value instanceof Set;

};

const isUndefined = ( value: unknown ): value is undefined => {

  return value === undefined;

};

/* EXPORT */

export {cloneDeep, isArray, isFunction, isPrimitive, isSet, isUndefined};
