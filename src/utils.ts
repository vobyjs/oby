
/* MAIN */

const {isArray} = Array;

const isFunction = ( value: unknown ): value is (( ...args: unknown[] ) => unknown) => {

  return typeof value === 'function';

};

const isSet = ( value: unknown ): value is Set<unknown> => {

  return value instanceof Set;

};

const isUndefined = ( value: unknown ): value is undefined => {

  return value === undefined;

};

const noop = (): void => {};

/* EXPORT */

export {isArray, isFunction, isSet, isUndefined, noop};
