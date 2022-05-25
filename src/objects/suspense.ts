
/* IMPORT */

import {SUSPENSE} from '~/constants';
import cleanup from '~/methods/cleanup';
import type {IEffect, ISuspense, SuspenseFunction} from '~/types';

/* MAIN */

class Suspense {

  /* VARIABLES */

  effects: Set<IEffect> = new Set (); //TODO: Try to delete this set, relying instead on other already existing properties of observers, perhaps
  suspenses: Set<ISuspense> = new Set ();
  suspended: number = 0; // 0: UNSUSPENDED, 1: THIS_SUSPENDED, 2+: THIS_AND_PARENT_SUSPENDED

  /* CONSTRUCTOR */

  constructor () {

    const parent = SUSPENSE.current;

    if ( parent ) {

      parent.registerSuspense ( this );

      cleanup ( () => parent.unregisterSuspense ( this ) );

      this.suspended = parent.suspended;

    }

  }

  /* REGISTRATION API */

  registerEffect ( effect: IEffect ): void {

    this.effects.add ( effect );

  }

  registerSuspense ( suspense: ISuspense ): void {

    this.suspenses.add ( suspense );

  }

  unregisterEffect ( effect: IEffect ): void {

    this.effects.delete ( effect );

  }

  unregisterSuspense ( suspense: ISuspense ): void {

    this.suspenses.delete ( suspense );

  }

  /* API */

  toggle ( force: boolean ): void {

    if ( !this.suspended && !force ) return; // Already suspended, this can happen at instantion time

    this.suspended += force ? 1 : -1;

    if ( this.suspended === 0 ) { // Resuming

      for ( const effect of this.effects ) {
        effect.unstale ( false );
      }

    } else if ( this.suspended === 1 ) { // Pausing

      for ( const effect of this.effects ) {
        effect.stale ( false );
      }

    }

    for ( const suspense of this.suspenses ) {
      suspense.toggle ( force );
    }

  }

  wrap ( fn: SuspenseFunction ): void {

    const suspensePrev = SUSPENSE.current;

    SUSPENSE.current = this;

    try {

      fn ();

    } finally {

      SUSPENSE.current = suspensePrev;

    }

  }

}

/* EXPORT */

export default Suspense;
