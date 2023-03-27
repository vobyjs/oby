
/* IMPORT */

import {DIRTY_NO, DIRTY_MAYBE_NO, DIRTY_MAYBE_YES, DIRTY_YES} from '~/constants';
import {OWNER} from '~/context';
import Owner from '~/objects/owner';
import {PoolObservableObservers, PoolObserverObservables, PoolOwnerObservers} from '~/objects/pool';
import type {IObservable, IOwner} from '~/types';

/* MAIN */

class Observer extends Owner {

  /* VARIABLES */

  parent: IOwner = OWNER;
  status: 0 | 1 | 2 | 3 = DIRTY_YES;
  // observables: PoolSet<IObservable>;

  /* CONSTRUCTOR */

  constructor () {

    super ();

    PoolOwnerObservers.register ( this.parent, this );

  }

  // hydrate (): this {

  //   this.parent = OWNER;
  //   this.status = DIRTY_YES;

  //   PoolOwnerObservers.register ( this.parent, this );

  //   return this;

  // }

  // dehydrate (): this {

  //   this.parent = NOOP_PARENT;

  //   return this;

  // }



  /* API */

  dispose ( deep: boolean ): void {

    if ( deep ) {

      PoolObserverObservables.forEachAndDelete ( this, observable => PoolObservableObservers.unregister ( observable, this ) );

    } else {

      PoolObserverObservables.forEachAndReset ( this, observable => PoolObservableObservers.unregister ( observable, this ) );

    }

    super.dispose ( deep );

  }

  link ( observable: IObservable<any> ): void {

    PoolObserverObservables.register ( this, observable );
    PoolObservableObservers.register ( observable, this );

  }

  run (): void {

    throw new Error ( 'Abstract method' );

  }

  stale ( status: 2 | 3 ): void {

    this.status = status;

  }

  update (): void {

    if ( this.status === DIRTY_MAYBE_YES ) {

      PoolObserverObservables.forEach ( this, observable => {

        observable.parent?.update ();

        if ( this.status === DIRTY_YES ) return false;

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
