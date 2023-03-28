
/* IMPORT */

import {OWNER, ROOT, SUSPENSE_ENABLED, setRoot} from '~/context';
import {lazySetAdd, lazySetDelete} from '~/lazy';
import Owner from '~/objects/owner';
import type {IOwner, WrappedDisposableFunction} from '~/types';

/* MAIN */

class Root extends Owner {

  /* VARIABLES */

  parent: IOwner = OWNER;
  suspense?: boolean;

  /* CONSTRUCTOR */

  constructor ( suspense: boolean ) {

    super ();

    if ( suspense ) {

      this.suspense = true;

    }

    if ( this.suspense && SUSPENSE_ENABLED ) {

      lazySetAdd ( this.parent, 'roots', this );

    }

  }

  /* API */

  dispose ( deep: boolean ): void {

    if ( this.suspense && SUSPENSE_ENABLED ) {

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
