
/* IMPORT */

import {DIRTY_MAYBE_YES, UNAVAILABLE, UNINITIALIZED} from '~/constants';
import Observable from '~/objects/observable';
import Observer from '~/objects/observer';
import type {IObservable, MemoFunction, MemoOptions} from '~/types';

/* MAIN */

class Memo<T = unknown> extends Observer {

  /* VARIABLES */

  fn: MemoFunction<T>;
  observable: IObservable<T>;
  sync?: boolean;

  /* CONSTRUCTOR */

  constructor ( fn: MemoFunction<T>, options?: MemoOptions<T> ) {

    super ();

    this.fn = fn;
    this.observable = new Observable<T> ( UNINITIALIZED, options, this );

    if ( options?.sync === true ) {

      this.sync = true;

      this.update ();

    }

  }

  /* API */

  run (): void {

    const result = super.refresh ( this.fn );

    if ( !this.disposed && this.observables.empty () ) {

      this.disposed = true;

    }

    if ( result !== UNAVAILABLE ) {

      this.observable.set ( result );

    }

  }

  stale ( status: number ): void {

    const statusPrev = this.status;

    if ( statusPrev >= status ) return;

    this.status = status;

    if ( statusPrev === DIRTY_MAYBE_YES ) return;

    this.observable.stale ( DIRTY_MAYBE_YES );

  }

}

/* EXPORT */

export default Memo;
