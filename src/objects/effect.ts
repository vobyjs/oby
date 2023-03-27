
/* IMPORT */

import {SUSPENSE_ENABLED} from '~/context';
import Observer from '~/objects/observer';
import {PoolOwnerCleanups} from '~/objects/pool';
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

    if ( SUSPENSE_ENABLED ) {
      if ( options?.suspense !== false ) {
        const suspense = this.get<ISuspense> ( SYMBOL_SUSPENSE );
        if ( suspense ) {
          this.suspense = suspense;
        }
      }
    }

    if ( options?.sync ) {
      this.sync = true;
    }

    this.schedule ();

  }

  /* API */

  dispose ( deep: boolean ): void {

    this.unschedule ();

    super.dispose ( deep );

  }

  run (): void {

    this.dispose ( false );

    const cleanup = this.wrap ( this.fn, this, this );

    if ( isFunction ( cleanup ) ) {

      PoolOwnerCleanups.register ( this, cleanup );

    }

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

    const isScheduled = ( this.sync && ( this.status === 2 || this.status === 3 ) );

    super.stale ( status );

    if ( !isScheduled ) this.schedule ();

  }

  update (): void {

    if ( this.suspense?.suspended ) return;

    super.update ();

  }

}

/* EXPORT */

export default Effect;
