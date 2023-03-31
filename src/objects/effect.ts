
/* IMPORT */

import {SUSPENSE_ENABLED} from '~/context';
import {lazyArrayPush} from '~/lazy';
import Observer from '~/objects/observer';
import Scheduler from '~/objects/scheduler.async';
import {SYMBOL_SUSPENSE} from '~/symbols';
import {isFunction} from '~/utils';
import type {ISuspense, EffectFunction, EffectOptions} from '~/types';

/* MAIN */

class Effect extends Observer {

  /* VARIABLES */

  fn: EffectFunction;
  suspense?: ISuspense;
  sync?: true;

  /* CONSTRUCTOR */

  constructor ( fn: EffectFunction, options?: EffectOptions ) {

    super ();

    this.fn = fn;

    if ( SUSPENSE_ENABLED && options?.suspense !== false ) {

      const suspense = this.get<ISuspense> ( SYMBOL_SUSPENSE );

      if ( suspense ) {

        this.suspense = suspense;

      }

    }

    if ( options?.sync ) {

      this.sync = true;

    }

    this.schedule ();

  }

  /* API */

  dispose (): void {

    this.unschedule ();

    super.dispose ();

  }

  run (): void {

    this.dispose ();

    const cleanup = this.wrap ( this.fn, this, this );

    if ( isFunction ( cleanup ) ) {

      lazyArrayPush ( this, 'cleanups', cleanup );

    }

  }

  schedule (): void {

    if ( this.sync ) {

      this.update ();

    } else {

      Scheduler.schedule ( this );

    }

  }

  stale ( status: number ): void {

    const statusPrev = this.status;

    if ( statusPrev === status ) return;

    this.status = status;

    if ( !this.sync || ( statusPrev !== 2 && statusPrev !== 3 ) ) { // It isn't currently executing, so let's schedule it

      this.schedule ();

    }

  }

  unschedule (): void {

    if ( !this.sync ) {

      Scheduler.unschedule ( this );

    }

  }

  update (): void {

    if ( this.suspense?.suspended ) return;

    super.update ();

  }

}

/* EXPORT */

export default Effect;
