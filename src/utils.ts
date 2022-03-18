
/* MAIN */

const {isArray} = Array;

const isFunction = ( value: unknown ): value is Function => {

  return typeof value === 'function';

};

const isMap = ( value: unknown ): value is Map<unknown, unknown> => {

  return value instanceof Map;

};

const isUndefined = ( value: unknown ): value is undefined => {

  return value === undefined;

};

/* EXPORT */

export {isArray, isFunction, isMap, isUndefined};
