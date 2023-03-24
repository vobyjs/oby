
/* IMPORT */

import Observer from '~/objects/observer';
import Scheduler from '~/objects/scheduler';
import {isFunction} from '~/utils';
import type {EffectFunction} from '~/types';

/* MAIN */

class Effect extends Observer {

  /* VARIABLES */

  fn: EffectFunction;

  /* CONSTRUCTOR */

  constructor ( fn: EffectFunction ) {

    super ();

    this.fn = fn;

    Scheduler.push ( this );

  }

  /* API */

  dispose (): void {

    Scheduler.pop ( this );

    super.dispose ();

  }

  stale ( status: 2 | 3 ): void {

    if ( this.status === status ) return;

    super.stale ( status );

    Scheduler.push ( this );

  }

  refresh (): void {

    this.dispose ();

    const cleanup = this.wrap ( this.fn, this, this );

    if ( isFunction ( cleanup ) ) {

      this.cleanups.push ( cleanup );

    }

  }

}

/* EXPORT */

export default Effect;
