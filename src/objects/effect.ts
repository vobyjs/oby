
/* IMPORT */

import {SUSPENSE_ENABLED} from '~/context';
import Observer from '~/objects/observer';
import Scheduler from '~/objects/scheduler';
import {SYMBOL_SUSPENSE} from '~/symbols';
import {isFunction} from '~/utils';
import type {ISuspense, EffectFunction, EffectOptions} from '~/types';

/* MAIN */

class Effect extends Observer {

  /* VARIABLES */

  fn: EffectFunction;
  suspense?: ISuspense;
  sync?: boolean;

  /* CONSTRUCTOR */

  constructor ( fn: EffectFunction, options?: EffectOptions ) {

    super ();

    this.fn = fn;
    this.suspense = SUSPENSE_ENABLED && options?.suspense !== false ? this.read ( SYMBOL_SUSPENSE ) : undefined;
    this.sync = !!options?.sync;

    this.schedule ();

  }

  /* API */

  dispose (): void {

    this.unschedule ();

    super.dispose ();

  }

  schedule (): void {

    if ( this.sync ) {

      this.update ();

    } else {

      Scheduler.push ( this );

    }

  }

  unschedule (): void {

    if ( !this.sync ) {

      Scheduler.pop ( this );

    }

  }

  stale ( status: 2 | 3 ): void {

    if ( this.status === status ) return;

    super.stale ( status );

    this.schedule ();

  }

  refresh (): void {

    this.dispose ();

    const cleanup = this.wrap ( this.fn, this, this );

    if ( isFunction ( cleanup ) ) {

      this.cleanups.push ( cleanup );

    }

  }

  update (): void {

    if ( this.suspense?.suspended ) return;

    super.update ();

  }

}

/* EXPORT */

export default Effect;
