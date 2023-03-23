
/* IMPORT */

import {DIRTY_NO, DIRTY_MAYBE, DIRTY_YES} from '~/constants';
import {OWNER} from '~/context';
import Owner from '~/objects/owner';
import {is} from '~/utils';
import type {IObservable, IOwner} from '~/types';

/* MAIN */

class Observer extends Owner {

  /* VARIABLES */

  parent: IOwner = OWNER;
  observables: Set<IObservable>;
  status: 0 | 1 | 2;

  /* CONSTRUCTOR */

  constructor () {

    super ();

    this.observables = new Set ();
    this.status = DIRTY_YES;

    this.parent.observers.push ( this );

  }

  /* API */

  dispose (): void {

    super.dispose ();

    this.observables.forEach ( observable => observable.observers.delete ( this ) );

    this.observables.clear ();

  }

  link ( observable: IObservable<any> ): void {

    this.observables.add ( observable );

    observable.observers.add ( this );

  }

  stale ( root: boolean ): void {

    this.status = root ? DIRTY_YES : DIRTY_MAYBE;

  }

  refresh (): void {

    throw new Error ( 'Abstract method' );

  }

  update (): void {

    if ( is ( this.status, DIRTY_MAYBE ) ) { //TSC: We don't want the type narrowed here

      for ( const observable of this.observables ) {

        observable.parent?.update ();

        if ( this.status === DIRTY_YES ) break;

      }

    }

    if ( this.status === DIRTY_YES ) {

      this.refresh ();

    }

    this.status = DIRTY_NO;

  }

}

/* EXPORT */

export default Observer;
