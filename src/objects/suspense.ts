
/* IMPORT */

import {DIRTY_MAYBE_YES, DIRTY_YES} from '~/constants';
import {OWNER, setSuspenseEnabled} from '~/context';
import {lazyArrayEach, lazyArrayPush, lazySetEach} from '~/lazy';
import Effect from '~/objects/effect';
import Owner from '~/objects/owner';
import {SYMBOL_SUSPENSE} from '~/symbols';
import {isFunction} from '~/utils';
import type {IObservable, IObserver, IOwner, IRoot, ISuspense, SuspenseFunction, Contexts, Signal} from '~/types';

/* MAIN */

class Suspense extends Owner {

  /* VARIABLES */

  parent: IOwner = OWNER;
  signal: Signal = OWNER.signal;
  contexts: Contexts = { [SYMBOL_SUSPENSE]: this };
  observable?: IObservable<boolean>;
  suspended: number;

  /* CONSTRUCTOR */

  constructor () {

    super ();

    setSuspenseEnabled ( true );

    lazyArrayPush ( this.parent, 'suspenses', this );

    this.suspended = ( OWNER.get<ISuspense> ( SYMBOL_SUSPENSE )?.suspended || 0 );

  }

  /* API */

  toggle ( force: boolean ): void {

    if ( !this.suspended && !force ) return; // Already suspended, this can happen at instantion time

    const suspendedPrev = this.suspended;
    const suspendedNext = suspendedPrev + ( force ? 1 : -1 );

    this.suspended = suspendedNext;

    if ( !!suspendedPrev === !!suspendedNext ) return; // Same state, nothing to pause or resume

    /* NOTIFYING OBSERVERS, ROOTS AND SUSPENSES */

    this.observable?.set ( !!suspendedNext );

    const notifyOwner = ( owner: IOwner ): void => {
      lazyArrayEach ( owner.observers, notifyObserver );
      lazyArrayEach ( owner.suspenses, notifySuspense );
      lazySetEach ( owner.roots, notifyRoot );
    };

    const notifyObserver = ( observer: IObserver ): void => {
      if ( observer instanceof Effect ) {
        if ( observer.status === DIRTY_MAYBE_YES || observer.status === DIRTY_YES ) {
          if ( observer.init ) {
            observer.update ();
          } else {
            observer.schedule ();
          }
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

  wrap <T> ( fn: SuspenseFunction<T> ): T {

    return super.wrap ( fn, this, undefined );

  }

}

/* EXPORT */

export default Suspense;
