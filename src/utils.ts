
/* MAIN */

const {isArray} = Array;

const isMap = ( value: unknown ): value is Map<unknown, unknown> => {

  return value instanceof Map;

};

/* EXPORT */

export {isArray, isMap};
