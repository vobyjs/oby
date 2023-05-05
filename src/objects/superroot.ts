
/* IMPORT */

import Owner from '~/objects/owner';
import type {Contexts, Signal} from '~/types';

/* MAIN */

class SuperRoot extends Owner {

  /* VARIABLES */

  parent: undefined;
  contexts: Contexts = {};
  signal: Signal = { disposed: false };

}

/* EXPORT */

export default SuperRoot;
