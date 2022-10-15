
/* IMPORT */

import Computation from '~/objects/computation';
import Observable from '~/objects/observable';
import {castError, max} from '~/utils';
import type {IObservable, MemoFunction, ObservableOptions} from '~/types';

/* MAIN */

class Memo<T = unknown> extends Computation {

  /* VARIABLES */

  fn: MemoFunction<T>;
  observable: IObservable<T>;

  /* CONSTRUCTOR */

  constructor ( fn: MemoFunction<T>, options?: ObservableOptions<T> ) {

    super ( fn );

    this.fn = fn;
    this.observable = new Observable ( undefined as any, options, this ); //TSC //FIXME: Equals function may break here, because it will be called the first time with "undefined" as the current value

    this.parent.registerObserver ( this );

    this.update ( true, true );

  }

  /* API */

  dispose ( deep?: boolean, immediate?: boolean ): void {

    if ( deep && !this.signal.disposed ) {

      this.observable.dispose ();

    }

    super.dispose ( deep, immediate );

  }

  stale ( fresh: boolean ): void {

    if ( !this.statusCount ) {

      this.observable.stale ( false );

    }

    super.stale ( fresh );

  }

  update ( fresh: boolean, first?: boolean ): void {

    if ( fresh && !this.observable.disposed && !this.observable.signal.disposed ) { // The resulting value might change

      const status = this.statusExecution;

      if ( status ) { // Currently executing or pending

        this.statusExecution = fresh ? 3 : max ( status, 2 );

        if ( status > 1 ) {

          this.observable.unstale ( false );

        }

      } else { // Currently sleeping

        this.statusExecution = 1;

        this.dispose ();

        try {

          const value = this.wrap ( this.fn );

          this.postdispose ();

          if ( this.observable.disposed || this.observable.signal.disposed ) { // Maybe a memo disposed of itself via a root before returning, or caused itself to re-execute

            this.observable.unstale ( false );

          } else if ( first ) {

            this.observable.value = value;

          } else {

            this.observable.write ( value );

          }

          if ( !this.observers && !this.observables && !this.cleanups ) { // Auto-disposable

            this.dispose ( true, true );

          }

        } catch ( error: unknown ) {

          this.postdispose ();

          this.catch ( castError ( error ), false );

          this.observable.unstale ( false );

        } finally {

          const status = this.statusExecution as ( 1 | 2 | 3 ); //TSC

          this.statusExecution = 0;

          if ( status > 1 ) {

            this.update ( status === 3 );

          }

        }

      }

    } else { // The resulting value could/should not possibly change

      this.observable.unstale ( false );

    }

  }

}

/* EXPORT */

export default Memo;
