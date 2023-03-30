
/* IMPORT */

import {DIRTY_NO, DIRTY_MAYBE_NO, DIRTY_MAYBE_YES, DIRTY_YES} from '~/constants';
import {OWNER} from '~/context';
import {lazyArrayPush} from '~/lazy';
import Owner from '~/objects/owner';
import type {IObservable, IOwner, Signal} from '~/types';

/* MAIN */

class Observer extends Owner {

  /* VARIABLES */

  parent: IOwner = OWNER;
  signal: Signal = OWNER.signal;
  status: number = DIRTY_YES;
  observables: IObservable[] = [];
  sync?: boolean;

  /* CONSTRUCTOR */

  constructor () {

    super ();

    lazyArrayPush ( this.parent, 'observers', this );

  }

  /* API */

  dispose (): void {

    const observables = this.observables;
    const observablesLength = observables.length;

    if ( observablesLength ) {

      for ( let i = 0, l = observables.length; i < l; i++ ) {

        observables[i].observers.delete ( this );

      }

      this.observables = [];

    }

    super.dispose ();

  }

  link ( observable: IObservable<any> ): void {

    const observers = observable.observers;
    const sizePrev = observers.size;

    observers.add ( this );

    const sizeNext = observers.size;

    if ( sizePrev === sizeNext ) return; // Quicker alternative to "Set.has" + "Set.add"

    this.observables.push ( observable );

  }

  run (): void {

    throw new Error ( 'Abstract method' );

  }

  stale ( status: number ): void {

    throw new Error ( 'Abstract method' );

  }

  update (): void {

    if ( this.signal.disposed ) return; // Disposed, it shouldn't be updated again

    if ( this.status === DIRTY_MAYBE_YES ) { // Maybe we are dirty, let's check with our observables, to be sure

      const observables = this.observables;

      for ( let i = 0, l = observables.length; i < l; i++ ) {

        observables[i].parent?.update ();

        if ( this.status === DIRTY_YES ) break; // We are dirty, no need to check the rest

      }

    }

    if ( this.status === DIRTY_YES ) { // We are dirty, let's refresh

      this.status = DIRTY_MAYBE_NO; // Trip flag, to be able to tell if we caused ourselves to be dirty again

      this.run ();

      if ( this.status === DIRTY_MAYBE_NO ) { // Not dirty anymore

        this.status = DIRTY_NO;

      } else { // Maybe we are still dirty, let's check again

        this.update ();

      }

    } else { // Not dirty

      this.status = DIRTY_NO;

    }

  }

}

/* EXPORT */

export default Observer;
