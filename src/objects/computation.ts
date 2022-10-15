
/* IMPORT */

import {OWNER, ROOT} from '~/constants';
import Observer from '~/objects/observer';
import type {IObserver, ObservedFunction, Signal} from '~/types';

/* MAIN */

class Computation extends Observer {

  /* VARIABLES */

  parent: IObserver = OWNER.current;
  signal: Signal = OWNER.current.signal || ROOT.current;
  statusCount: number = 0; // The count is incremented on stale messages and decremented on unstale messages
  statusExecution: 0 | 1 | 2 | 3 = 0; // 0: SLEEPING, 1: EXECUTING, 2: PENDING_NO_FRESH, 3: PENDING_FRESH
  statusFresh: boolean = false;

  /* API */

  emit ( change: -1 | 1, fresh: boolean ): void {

    if ( change < 0 && !this.statusCount ) return; // The computation updated itself already

    this.statusCount += change;
    this.statusFresh ||= fresh;

    if ( this.statusCount ) return;

    fresh = this.statusFresh;

    this.statusFresh = false;

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
