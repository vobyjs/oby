
/* IMPORT */

import {OWNER, ROOT, SUSPENSE_ENABLED, setRoot} from '~/context';
import {lazySetAdd, lazySetDelete} from '~/lazy';
import Owner from '~/objects/owner';
import type {IOwner, WrappedDisposableFunction, Signal} from '~/types';

/* MAIN */

class Root extends Owner {

  /* VARIABLES */

  parent: IOwner = OWNER;
  signal: Signal = { disposed: false };
  suspense?: true;

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

  dispose (): void {

    if ( this.suspense && SUSPENSE_ENABLED ) {

      lazySetDelete ( this.parent, 'roots', this );

    }

    this.signal.disposed = true;

    super.dispose ();

  }

  wrap <T> ( fn: WrappedDisposableFunction<T> ): T {

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
