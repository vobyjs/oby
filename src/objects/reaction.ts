
/* IMPORT */

import {OWNER} from '~/constants';
import Observer from '~/objects/observer';
import type {IObserver} from '~/types';

/* MAIN */

class Reaction extends Observer {

  /* VARIABLES */

  parent: IObserver = OWNER.current;
  statusCount: number = 0;
  statusFresh: boolean = false;

  /* API */

  stale ( fresh: boolean ): void {

    this.statusCount += 1;
    this.statusFresh ||= fresh;

  }

  unstale ( fresh: boolean ): void {

    if ( !this.statusCount ) return; // The reaction updated itself already

    this.statusCount -= 1;
    this.statusFresh ||= fresh;

    if ( this.statusCount ) return;

    fresh = this.statusFresh;

    this.statusFresh = false;

    this.update ( fresh );

  }

  update ( fresh: boolean ): void {}

}

/* EXPORT */

export default Reaction;
