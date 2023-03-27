
/* IMPORT */

import {DIRTY_MAYBE_YES} from '~/constants';
import Observable from '~/objects/observable';
import Observer from '~/objects/observer';
import {SYMBOL_VALUE_INITIAL} from '~/symbols';
import type {IObservable, MemoFunction, ObservableOptions} from '~/types';

/* MAIN */

class Memo<T = unknown> extends Observer {

  /* VARIABLES */

  fn: MemoFunction<T>;
  observable: IObservable<T>;

  /* CONSTRUCTOR */

  constructor ( fn: MemoFunction<T>, options?: ObservableOptions<T> ) {

    super ();

    this.fn = fn;
    this.observable = new Observable<T> ( SYMBOL_VALUE_INITIAL as any, options, this ); //TSC

  }

  /* API */

  stale ( status: 2 | 3 ): void {

    if ( this.status === status ) return;

    super.stale ( status );

    this.observable.stale ( DIRTY_MAYBE_YES );

  }

  run (): void {

    this.dispose ( false );

    const value = this.wrap ( this.fn, this, this );

    this.observable.set ( value );

  }

}

/* EXPORT */

export default Memo;
