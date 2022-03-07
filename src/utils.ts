
/* MAIN */

const {isArray} = Array;

const isFunction = ( value: unknown ): value is Function => {

  return typeof value === 'function';

};

const isSet = ( value: unknown ): value is Set<unknown> => {

  return value instanceof Set;

};

const isUndefined = ( value: unknown ): value is undefined => {

  return value === undefined;

};

/* EXPORT */

export {isArray, isFunction, isSet, isUndefined};
