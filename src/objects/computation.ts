
/* IMPORT */

import {OWNER, ROOT} from '~/constants';
import Observer from '~/objects/observer';
import {getExecution, getFresh, setFresh, getCount, changeCount} from '~/status';
import type {IObserver, ObservedFunction, Signal} from '~/types';

/* MAIN */

class Computation extends Observer {

  /* VARIABLES */

  parent: IObserver = OWNER.current;
  signal: Signal = ROOT.current;
  status: number = 0;

  /* API */

  emit ( change: -1 | 1, fresh: boolean ): void {

    if ( change < 0 && !getCount ( this.status ) ) return; // The computation updated itself already

    this.status = changeCount ( this.status, change );
    this.status = setFresh ( this.status, fresh );

    if ( getCount ( this.status ) ) return;

    fresh = getFresh ( this.status );

    this.status = getExecution ( this.status );

    if ( this.inactive ) return;

    this.update ( fresh );

  }

  update ( fresh: boolean ): void {}

  wrap <T> ( fn: ObservedFunction<T>, tracking: boolean = true ): T {

    return super.wrap ( fn, tracking );

  }

}

/* EXPORT */

export default Computation;
