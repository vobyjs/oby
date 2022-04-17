
/* IMPORT */

import type {PlainSuperRoot} from './types';

/* MAIN */

const SuperRoot = {

  /* API */

  create: (): PlainSuperRoot => {

    return {
      cleanups: null,
      context: null,
      errors: null,
      observables: null,
      observers: null,
      parent: null
    };

  }

};

/* EXPORT */

export default SuperRoot;
