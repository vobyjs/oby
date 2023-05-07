
/* IMPORT */

import Owner from '~/objects/owner';
import type {Contexts} from '~/types';

/* MAIN */

class SuperRoot extends Owner {

  /* VARIABLES */

  parent: undefined;
  contexts: Contexts = {};

}

/* EXPORT */

export default SuperRoot;
