
/* IMPORT */

import {OWNER, ROOT, setRoot} from '~/context';
import Owner from '~/objects/owner';
import type {IOwner, ObservedDisposableFunction} from '~/types';

/* MAIN */

//TODO: Throw when registering stuff after disposing, mainly relevant when roots are used
//TODO: disposed prop?

class Root extends Owner {

  /* VARIABLES */

  parent: IOwner = OWNER;

  /* CONSTRUCTOR */

  constructor () {

    super ();

    this.parent.roots.push ( this ); //TODO: Only if suspense is used?

  }

  /* API */

  dispose (): void {

    //TODO: remove root from parent

    super.dispose ();

  }

  wrap <T> ( fn: ObservedDisposableFunction<T> ): T | undefined {

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

//TODO: REVIEW
