
/* IMPORT */

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
  init?: true;
  sync?: true;

  /* CONSTRUCTOR */

  constructor ( fn: EffectFunction, options?: EffectOptions ) {

    super ();

    this.fn = fn;

    if ( options?.suspense !== false ) {

      const suspense = this.get ( SYMBOL_SUSPENSE );

      if ( suspense ) {

        this.suspense = suspense;

      }

    }

    if ( options?.sync === true ) {

      this.sync = true;

    }

    if ( options?.sync === 'init' ) {

      this.init = true;

      this.update ();

    } else {

      this.schedule ();

    }

  }

  /* API */

  run (): void {

    const result = super.refresh ( this.fn );

    if ( isFunction ( result ) ) {

      lazyArrayPush ( this, 'cleanups', result );

    }

  }

  schedule (): void {

    if ( this.suspense?.suspended ) return;

    if ( this.sync ) {

      this.update ();

    } else {

      Scheduler.schedule ( this );

    }

  }

  stale ( status: number ): void {

    const statusPrev = this.status;

    if ( statusPrev >= status ) return;

    this.status = status;

    if ( !this.sync || ( statusPrev !== 2 && statusPrev !== 3 ) ) { // It isn't currently executing, so let's schedule it

      this.schedule ();

    }

  }

  update (): void {

    if ( this.suspense?.suspended ) return;

    super.update ();

  }

}

/* EXPORT */

export default Effect;
