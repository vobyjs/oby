
/* IMPORT */

import {OWNER, ROOT, setRoot} from '~/context';
import Owner from '~/objects/owner';
import type {IOwner, ObservedDisposableFunction} from '~/types';

/* MAIN */

//TODO: Throw when registering stuff after disposing, mainly relevant when roots are used

class Root extends Owner {

  /* VARIABLES */

  parent: IOwner = OWNER;

  /* CONSTRUCTOR */

  constructor () {

    super ();

    this.parent.roots.push ( this );

  }

  /* API */

  wrap <T> ( fn: ObservedDisposableFunction<T> ): T {

    const dispose = () => this.dispose ();
    const fnWithDispose = () => fn ( dispose );

    const rootPrev = ROOT;

    setRoot ( this );

    try {

      return super.wrap ( fnWithDispose, this, undefined );

    } finally {

      setRoot ( rootPrev );

    }

  }

}

/* EXPORT */

export default Root;
