
/* IMPORT */

import {OWNER, ROOT} from '~/constants';
import Observer from '~/objects/observer';
import Signal from '~/objects/signal';
import type {IObserver, ISignal, ObservedDisposableFunction} from '~/types';

/* MAIN */

class Root extends Observer {

  /* VARIABLES */

  parent: IObserver = OWNER.current;
  signal: ISignal = new Signal ();

  /* API */

  dispose ( deep?: boolean, immediate?: boolean ): void {

    this.signal.dispose ();

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
