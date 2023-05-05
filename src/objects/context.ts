
/* IMPORT */

import {OWNER} from '~/context';
import Owner from '~/objects/owner';
import type {IOwner, ContextFunction, Contexts, Signal} from '~/types';

/* MAIN */

class Context extends Owner {

  /* VARIABLES */

  parent: IOwner = OWNER;
  contexts: Contexts;
  signal: Signal = OWNER.signal;

  /* CONSTRUCTOR */

  constructor ( contexts: Contexts ) {

    super ();

    this.contexts = { ...OWNER.contexts, ...contexts };

  }

  /* API */

  wrap <T> ( fn: ContextFunction<T> ): T {

    return super.wrap ( fn, this, undefined );

  }

}

/* EXPORT */

export default Context;
