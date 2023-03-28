
/* IMPORT */

import {DIRTY_NO, DIRTY_MAYBE_NO, DIRTY_MAYBE_YES, DIRTY_YES} from '~/constants';
import {OWNER} from '~/context';
import {lazyArrayPush} from '~/lazy';
import Owner from '~/objects/owner';
import type {IObservable, IOwner} from '~/types';

/* MAIN */

//TODO: Optimize disposal, sometimes it's unnecessary to empty out the array of observables

class Observer extends Owner {

  /* VARIABLES */

  parent: IOwner = OWNER;
  status: number = DIRTY_YES;
  observables: IObservable[] = [];
  sync?: boolean;

  /* CONSTRUCTOR */

  constructor () {

    super ();

    lazyArrayPush ( this.parent, 'observers', this );

  }

  /* API */

  dispose ( deep: boolean ): void {

    const observables = this.observables;

    for ( let i = 0, l = observables.length; i < l; i++ ) {

      observables[i].observers.delete ( this );

    }

    this.observables = [];

    super.dispose ( deep );

  }

  link ( observable: IObservable<any> ): void {

    const observers = observable.observers;
    const sizePrev = observers.size;

    observers.add ( this );

    const sizeNext = observers.size;

    if ( sizeNext === sizePrev ) return;

    this.observables.push ( observable );

  }

  run (): void {

    throw new Error ( 'Abstract method' );

  }

  stale ( status: number ): void {

    throw new Error ( 'Abstract method' );

  }

  update (): void {

    if ( this.status === DIRTY_MAYBE_YES ) {

      const observables = this.observables;

      for ( let i = 0, l = observables.length; i < l; i++ ) {

        const observable = observables[i];

        observable.parent?.update ();

        if ( this.status === DIRTY_YES ) break;

      }

    }

    if ( this.status === DIRTY_YES ) {

      this.status = DIRTY_MAYBE_NO;

      this.run ();

      if ( this.status === DIRTY_MAYBE_NO ) {

        this.status = DIRTY_NO;

      } else {

        this.run ();

      }

    } else {

      this.status = DIRTY_NO;

    }

  }

}

/* EXPORT */

export default Observer;
