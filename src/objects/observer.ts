
/* IMPORT */

import {DIRTY_NO, DIRTY_MAYBE_NO, DIRTY_MAYBE_YES, DIRTY_YES, DIRTY_DISPOSED} from '~/constants';
import {OWNER, SUPER_OWNER} from '~/context';
import {lazyArrayPush} from '~/lazy';
import Owner from '~/objects/owner';
import type {IObservable, IOwner, ObserverFunction, Signal} from '~/types';

/* MAIN */

class Observer extends Owner {

  /* VARIABLES */

  parent: IOwner = OWNER;
  signal: Signal = OWNER.signal;
  status: number = DIRTY_YES;
  observables: IObservable<any>[] | Set<IObservable<any>> = [];
  observablesIndex: number = 0;
  sync?: boolean;

  /* CONSTRUCTOR */

  constructor () {

    super ();

    if ( OWNER !== SUPER_OWNER ) {

      lazyArrayPush ( this.parent, 'observers', this );

    }

  }

  /* API */

  dispose ( shallow?: boolean ): void {

    if ( !shallow ) {

      this.status = DIRTY_DISPOSED;

      const observables = this.observables;

      if ( observables instanceof Array ) {

        for ( let i = 0; i < observables.length; i++ ) {

          observables[i].observers.delete ( this );

        }

      } else {

        for ( const observable of observables ) {

          observable.observers.delete ( this );

        }

      }

    }

    this.observablesIndex = 0;

    super.dispose ();

  }

  postdispose (): void {

    const observables = this.observables;

    if ( observables instanceof Array ) {

      const observablesIndex = this.observablesIndex;
      const observablesLength = observables.length;

      if ( observablesIndex < observablesLength ) {

        for ( let i = observablesIndex; i < observablesLength; i++ ) {

          observables[i].observers.delete ( this );

        }

        observables.length = observablesIndex;

      }

    }

  }

  link ( observable: IObservable<any> ): void {

    const observables = this.observables;

    if ( observables instanceof Array ) {

      const observablesIndex = this.observablesIndex;
      const observablesLength = observables.length;

      if ( observablesIndex <= observablesLength ) {

        const idx = observables.indexOf ( observable );

        if ( idx >= 0 && idx < observablesIndex ) {

          return;

        }

        if ( idx === observablesIndex ) {

          this.observablesIndex += 1;

          return;

        }

        if ( observablesIndex < observablesLength - 1 ) {

          this.postdispose ();

        } else if ( observablesIndex === observablesLength - 1 ) {

          observables[observablesIndex].observers.delete ( this );

        }

        observable.observers.add ( this );

        observables[this.observablesIndex++] = observable;

        if ( observablesIndex === 128 ) {

          this.observables = new Set ( observables );

        }

      }

    } else {

      const sizePrev = observables.size;

      observable.observers.add ( this );

      const sizeNext = observables.size;

      if ( sizePrev === sizeNext ) return; // Cheaper than Set.has+Set.add

      observables.add ( observable );

    }

  }

  refresh <T> ( fn: ObserverFunction<T> ): T {

    this.dispose ( true );

    this.status = DIRTY_MAYBE_NO; // Resetting the trip flag, we didn't re-execute just yet

    try {

      return this.wrap ( fn, this, this );

    } finally {

      this.postdispose ();

    }

  }

  run (): void {

    throw new Error ( 'Abstract method' );

  }

  stale ( status: number ): void {

    throw new Error ( 'Abstract method' );

  }

  update (): void {

    if ( this.signal.disposed ) return; // Disposed, it shouldn't be updated again

    if ( this.status === DIRTY_DISPOSED ) return; // Disposed, it shouldn't be updated again

    if ( this.status === DIRTY_MAYBE_YES ) { // Maybe we are dirty, let's check with our observables, to be sure

      const observables = this.observables;

      if ( observables instanceof Array ) {

        for ( let i = 0, l = observables.length; i < l; i++ ) {

          observables[i].parent?.update ();

          // if ( this.status === DIRTY_YES ) break; // We are dirty, no need to check the rest //TODO: This line makes the system lazier, but it conflicts with synchronous computations and optimized disposal

        }

      } else {

        for ( const observable of observables ) {

          observable.parent?.update ();

          // if ( this.status === DIRTY_YES ) break; // We are dirty, no need to check the rest //TODO: This line makes the system lazier, but it conflicts with synchronous computations and optimized disposal

        }

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
