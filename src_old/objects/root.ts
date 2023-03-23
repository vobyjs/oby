
/* IMPORT */

import {OWNER, ROOT, setRoot} from '~/context';
import suspended from '~/methods/suspended';
import Observer from '~/objects/observer';
import {isNumber} from '~/utils';
import type {IObserver, ObservedDisposableFunction} from '~/types';

/* MAIN */

class Root extends Observer {

  /* VARIABLES */

  parent: IObserver = OWNER;
  disposed?: boolean;
  pausable?: boolean;

  /* CONSTRUCTOR */

  constructor ( pausable?: boolean ) {

    super ();

    if ( pausable && isNumber ( suspended () ) ) {

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

    const rootPrev = ROOT;

    setRoot ( this );

    try {

      return super.wrap ( fnWithDispose );

    } finally {

      setRoot ( rootPrev );

    }

  }

}

/* EXPORT */

export default Root;
