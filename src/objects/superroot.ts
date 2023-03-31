
/* IMPORT */

import Owner from '~/objects/owner';
import type {Signal} from '~/types';

/* MAIN */

class SuperRoot extends Owner {

  /* VARIABLES */

  parent: undefined;
  signal: Signal = { disposed: false };

}

/* EXPORT */

export default SuperRoot;
