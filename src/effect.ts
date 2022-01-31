
/* IMPORT */

import Context from './context';
import Observer from './observer';
import {EffectFunction} from './types';

/* MAIN */

class Effect extends Observer {

  /* VARIABLES */

  private fn: EffectFunction;

  /* CONSTRUCTOR */

  constructor ( fn: EffectFunction ) {

    super ();

    this.fn = fn;

    this.update ();

  }

  /* API */

  update (): void {

    Context.registerObserver ( this );

    Observer.unsubscribe ( this );

    delete this.dirty;

    const cleanup = Context.wrapWith ( () => this.fn (), this, false );

    if ( cleanup ) {

      this.registerCleanup ( cleanup );

    }

  }

  /* STATIC API */

  static wrap ( fn: EffectFunction ): void {

    new Effect ( fn );

  }

}

/* EXPORT */

export default Effect;
