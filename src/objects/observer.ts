
/* IMPORT */

import {DIRTY_NO, DIRTY_MAYBE_NO, DIRTY_MAYBE_YES, DIRTY_YES} from '~/constants';
import {OWNER} from '~/context';
import {lazyArrayPush} from '~/lazy';
import Owner from '~/objects/owner';
import type {IObservable, IOwner} from '~/types';

/* MAIN */

class Observer extends Owner {

  /* VARIABLES */

  parent: IOwner = OWNER;
  status: 0 | 1 | 2 | 3 = DIRTY_YES;
  observables: IObservable[] = [];
  sync?: boolean;

  /* CONSTRUCTOR */

  constructor () {

    super ();

    lazyArrayPush ( this.parent, 'observers', this );

  }

  /* API */

  dispose ( deep: boolean ): void {

    for ( let i = 0, l = this.observables.length; i < l; i++ ) {

      this.observables[i].observers.delete ( this );

    }

    this.observables = [];

    super.dispose ( deep );

  }

  link ( observable: IObservable<any> ): void {

    if ( this.observables.length ) return;

    const sizePrev = observable.observers.size;

    observable.observers.add ( this );

    const sizeNext = observable.observers.size;

    if ( sizeNext === sizePrev ) return;

    this.observables.push ( observable );

  }

  run (): void {

    throw new Error ( 'Abstract method' );

  }

  stale ( status: 2 | 3 ): void {

    this.status = status;

  }

  update (): void {

    if ( this.status === DIRTY_MAYBE_YES ) {

      for ( let i = 0, l = this.observables.length; i < l; i++ ) {

        const observable = this.observables[i];

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
