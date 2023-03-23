
/* IMPORT */

import Observer from '~/objects/observer';
import Scheduler from '~/objects/scheduler';
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

    super.dispose ();

    Scheduler.pop ( this );

  }

  stale ( root: boolean ): void {

    super.stale ( root );

    Scheduler.push ( this );

  }

  refresh (): void {

    this.dispose ();

    this.wrap ( this.fn, this, this );

  }

}

/* EXPORT */

export default Effect;
