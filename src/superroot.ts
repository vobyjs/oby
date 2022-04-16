
/* IMPORT */

import type {PlainSuperRoot} from './types';

/* MAIN */

const SuperRoot = {

  /* API */

  create: (): PlainSuperRoot => {

    return {
      symbol: 6,
      staleCount: 0,
      staleFresh: false,
      cleanups: [],
      context: {},
      errors: [],
      observables: [],
      observers: [],
      parent: undefined
    };

  }

};

/* EXPORT */

export default SuperRoot;
