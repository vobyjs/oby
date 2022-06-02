
/* IMPORT */

import {OWNER, ROOT} from '~/constants';
import suspendable from '~/methods/suspendable';
import Observer from '~/objects/observer';
import type {IObserver, ObservedDisposableFunction} from '~/types';

/* MAIN */

class Root extends Observer {

  /* VARIABLES */

  parent: IObserver = OWNER.current;
  disposed?: boolean;
  pausable?: boolean;

  /* CONSTRUCTOR */

  constructor ( pausable?: boolean ) {

    super ();

    if ( pausable && suspendable () ) {

      this.pausable = true;

      this.parent.registerRoot ( this );

    }

  }

  /* API */

  dispose ( deep?: boolean, immediate?: boolean ): void {

    this.disposed = true;

    if ( this.pausable ) {

      this.parent.unregisterRoot ( this );

    }

    super.dispose ( deep, immediate );

  }

  wrap <T> ( fn: ObservedDisposableFunction<T> ): T {

    const dispose = this.dispose.bind ( this, true, true );
    const fnWithDispose = fn.bind ( undefined, dispose );

    const rootPrev = ROOT.current;

    ROOT.current = this;

    try {

      return super.wrap ( fnWithDispose );

    } finally {

      ROOT.current = rootPrev;

    }

  }

}

/* EXPORT */

export default Root;
