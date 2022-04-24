
/* IMPORT */

import {OWNER} from '~/constants';
import Observer from '~/objects/observer';
import type {IObserver, ObservedDisposableFunction} from '~/types';

/* MAIN */

class Root extends Observer {

  /* VARIABLES */

  parent: IObserver = OWNER.current;

  /* API */

  wrap <T> ( fn: ObservedDisposableFunction<T> ): T {

    const dispose = this.dispose.bind ( this, true, true );
    const fnWithDispose = fn.bind ( undefined, dispose );

    return super.wrap ( fnWithDispose );

  }

}

/* EXPORT */

export default Root;
