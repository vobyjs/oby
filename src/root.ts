
/* IMPORT */

import Observer from './observer';
import Owner from './owner';
import type {OwnerFunction, PlainRoot} from './types';

/* MAIN */

const Root = {

  /* WRAPPING API */

  wrap: <T> ( fn: OwnerFunction<T> ): T => {

    const root = Root.create ();

    let result: T;

    try {

      result = Owner.wrapWith ( fn, root, true );

    } catch ( error: unknown ) {

      Observer.updateError ( root, error );

    }

    return result!;

  },

  /* API */

  create: (): PlainRoot => {

    return {
      symbol: 5,
      staleCount: 0,
      staleFresh: false,
      cleanups: [],
      context: {},
      errors: [],
      observables: [],
      observers: [],
      parent: Owner.get ()
    };

  }

};

/* EXPORT */

export default Root;
