
/* IMPORT */

import {DIRTY_NO, DIRTY_MAYBE_NO, DIRTY_MAYBE_YES, DIRTY_YES} from '~/constants';
import {OWNER} from '~/context';
import {lazyArrayPush, lazySetAdd, lazySetDelete, lazySetEach} from '~/lazy';
import Owner from '~/objects/owner';
import type {IObservable, IOwner, LazySet} from '~/types';

/* MAIN */

class Observer extends Owner {

  /* VARIABLES */

  parent: IOwner = OWNER;
  status: 0 | 1 | 2 | 3 = DIRTY_YES;
  observables: LazySet<IObservable>;

  /* CONSTRUCTOR */

  constructor () {

    super ();

    lazyArrayPush ( this.parent, 'observers', this );

  }

  /* API */

  dispose ( deep: boolean ): void {

    lazySetEach ( this.observables, observable => lazySetDelete ( observable, 'observers', this ) );

    this.observables = new Set ();

    super.dispose ( deep );

  }

  link ( observable: IObservable<any> ): void {

    lazySetAdd ( this, 'observables', observable );

    lazySetAdd ( observable, 'observers', this );

  }

  run (): void {

    throw new Error ( 'Abstract method' );

  }

  stale ( status: 2 | 3 ): void {

    this.status = status;

  }

  update (): void {

    if ( this.status === DIRTY_MAYBE_YES ) {

      lazySetEach ( this.observables, observable => {

        observable.parent?.update ();

        if ( this.status === DIRTY_YES ) return false; //FIXME: this doesn't bail out the loop though

      });

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
