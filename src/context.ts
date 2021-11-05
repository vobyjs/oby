
/* IMPORT */

import {IContext} from './types';

/* MAIN */

class Context {

  /* VARIABLES */

  private contexts: Set<IContext> = new Set ();
  private current: IContext | undefined = undefined;

  /* API */

  get = (): IContext | undefined => {

    return this.current;

  }

  with = ( context: IContext, fn: () => void ): void => {

    if ( this.contexts.has ( context ) ) throw Error ( 'Circular computation detected' );

    const prev = this.current;

    this.contexts.add ( context );

    this.current = context;

    try {

      fn ();

    } finally {

      this.contexts.delete ( context );

      this.current = prev;

    }

  }

};

/* EXPORT */

export default new Context ();
