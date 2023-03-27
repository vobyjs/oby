
/* IMPORT */

import {DIRTY_MAYBE_YES, DIRTY_YES} from '~/constants';
import {OWNER, setSuspenseEnabled} from '~/context';
import {lazyArrayEach} from '~/lazy';
import Effect from '~/objects/effect';
import Owner from '~/objects/owner';
import {PoolOwnerObservers, PoolOwnerRoots, PoolOwnerSuspenses} from '~/objects/pool';
import {SYMBOL_SUSPENSE} from '~/symbols';
import {isFunction} from '~/utils';
import type {IObserver, IOwner, IRoot, ISuspense, SuspenseFunction} from '~/types';

/* MAIN */

class Suspense extends Owner {

  /* VARIABLES */

  parent: IOwner = OWNER;
  suspended: number;

  /* CONSTRUCTOR */

  constructor () {

    super ();

    setSuspenseEnabled ( true );

    PoolOwnerSuspenses.register ( this.parent, this );

    this.suspended = ( OWNER.get<ISuspense> ( SYMBOL_SUSPENSE )?.suspended || 0 ); //TODO: This probably requires a +1, because .toggle is called immediately

    this.set ( SYMBOL_SUSPENSE, this );

  }

  /* API */

  toggle ( force: boolean ): void {

    if ( !this.suspended && !force ) return; // Already suspended, this can happen at instantion time

    this.suspended += ( force ? 1 : -1 );

    if ( this.suspended ) return; // Still suspended, nothing to resume

    /* NOTIFYING OBSERVERS, ROOTS AND SUSPENSES */

    const notifyOwner = ( owner: IOwner ): void => {
      PoolOwnerObservers.forEach ( owner, notifyObserver );
      PoolOwnerSuspenses.forEach ( owner, notifySuspense );
      PoolOwnerRoots.forEach ( owner, notifyRoot );
    };

    const notifyObserver = ( observer: IObserver ): void => {
      if ( observer instanceof Effect ) {
        if ( observer.status === DIRTY_MAYBE_YES || observer.status === DIRTY_YES ) {
          observer.schedule ();
        }
      }
      notifyOwner ( observer );
    };

    const notifyRoot = ( root: IRoot | (() => IRoot[]) ): void => {
      if ( isFunction ( root ) ) {
        root ().forEach ( notifyOwner );
      } else {
        notifyOwner ( root );
      }
    };

    const notifySuspense = ( suspense: ISuspense ): void => {
      suspense.toggle ( force );
    };

    notifyOwner ( this );

  }

  wrap <T> ( fn: SuspenseFunction<T> ): T | undefined {

    return super.wrap ( fn, this, undefined );

  }

}

/* EXPORT */

export default Suspense;

//TODO: REVIEW
