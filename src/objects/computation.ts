
/* IMPORT */

import {OWNER, ROOT} from '~/constants';
import Observer from '~/objects/observer';
import type {IObserver, ISignal} from '~/types';

/* MAIN */

class Computation extends Observer {

  /* VARIABLES */

  parent: IObserver = OWNER.current;
  signal: ISignal = OWNER.current.signal || ROOT.current.signal;
  statusCount: number = 0; // The count is incremented on stale messages and decremented on unstale messages
  statusExecution: 0 | 1 | 2 | 3 = 0; // 0: SLEEPING, 1: EXECUTING, 2: PENDING_NO_FRESH, 3: PENDING_FRESH
  statusFresh: boolean = false;

  /* API */

  stale ( fresh: boolean ): void {

    this.statusCount += 1;
    this.statusFresh ||= fresh;

  }

  unstale ( fresh: boolean ): void {

    if ( !this.statusCount ) return; // The computation updated itself already

    this.statusCount -= 1;
    this.statusFresh ||= fresh;

    if ( this.statusCount ) return;

    fresh = this.statusFresh;

    this.statusFresh = false;

    if ( this.inactive ) return;

    this.update ( fresh );

  }

  update ( fresh: boolean ): void {}

}

/* EXPORT */

export default Computation;
