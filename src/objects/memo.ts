
/* IMPORT */

import {DIRTY_MAYBE_YES, OBSERVER_DISPOSED} from '~/constants';
import Observable from '~/objects/observable';
import Observer from '~/objects/observer';
import {SYMBOL_VALUE_INITIAL} from '~/symbols';
import type {IObservable, MemoFunction, ObservableOptions} from '~/types';

/* MAIN */

class Memo<T = unknown> extends Observer {

  /* VARIABLES */

  fn: MemoFunction<T>;
  observable: IObservable<T>;
  sync?: false;

  /* CONSTRUCTOR */

  constructor ( fn: MemoFunction<T>, options?: ObservableOptions<T> ) {

    super ();

    this.fn = fn;
    this.observable = new Observable<T> ( SYMBOL_VALUE_INITIAL as any, options, this ); //TSC: Maybe implement the initial value more cleanly, without an assertion

  }

  /* API */

  run (): void {

    this.dispose ();

    const value = this.wrap ( this.fn, this, this );

    if ( this.signal.disposed || !this.observables.length ) {

      this.observable.parent = OBSERVER_DISPOSED;

    }

    this.observable.set ( value );

  }

  stale ( status: number ): void {

    if ( this.status === status ) return;

    this.status = status;

    this.observable.stale ( DIRTY_MAYBE_YES );

  }

}

/* EXPORT */

export default Memo;
