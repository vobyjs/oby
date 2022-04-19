
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

      Observer.error ( root, error );

    }

    return result!;

  },

  /* API */

  create: (): PlainRoot => {

    const root = {
      cleanups: null,
      context: null,
      errors: null,
      observables: null,
      observers: null,
      roots: 0,
      parent: Owner.get ()
    };

    Owner.registerRoot ( root );

    return root;

  }

};

/* EXPORT */

export default Root;
