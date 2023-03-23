
/* IMPORT */

import Observable from '~/objects/observable';
import Observer from '~/objects/observer';
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
    this.observable = new Observable<T> ( undefined as any, options, this ); //TSC

  }

  /* API */

  stale ( root: boolean ): void {

    super.stale ( root );

    this.observable.stale ( false );

  }

  refresh (): void {

    this.dispose ();

    const value = this.wrap ( this.fn, this, this );

    this.observable.write ( value );

    //TOOD: mark stuff also

  }

}

/* EXPORT */

export default Memo;
