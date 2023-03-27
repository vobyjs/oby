
/* IMPORT */

import {OWNER, ROOT, SUSPENSE_ENABLED, setRoot} from '~/context';
import {lazySetAdd, lazySetDelete} from '~/lazy';
import Owner from '~/objects/owner';
import type {IOwner, WrappedDisposableFunction} from '~/types';

/* MAIN */

//TODO: Throw when registering stuff after disposing, mainly relevant when roots are used
//TODO: disposed prop?

class Root extends Owner {

  /* VARIABLES */

  parent: IOwner = OWNER;

  /* CONSTRUCTOR */

  constructor () {

    super ();

    if ( SUSPENSE_ENABLED ) {
      lazySetAdd ( this.parent, 'roots', this );
    }

  }

  /* API */

  dispose ( deep: boolean ): void {

    if ( SUSPENSE_ENABLED ) {
      lazySetDelete ( this.parent, 'roots', this );
    }

    super.dispose ( deep );

  }

  wrap <T> ( fn: WrappedDisposableFunction<T> ): T {

    const dispose = () => this.dispose ( true );
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
