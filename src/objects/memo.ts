
/* IMPORT */

import {NOOP} from '~/constants';
import Computation from '~/objects/computation';
import Observable from '~/objects/observable';
import {getExecution, setExecution, getCount} from '~/status';
import {castError, max} from '~/utils';
import type {IObservable, MemoFunction, ObservableOptions} from '~/types';

/* MAIN */

class Memo<T = unknown> extends Computation {

  /* VARIABLES */

  fn: MemoFunction<T>;
  observable: IObservable<T>;

  /* CONSTRUCTOR */

  constructor ( fn: MemoFunction<T>, options?: ObservableOptions<T> ) {

    super ();

    this.fn = fn;
    this.observable = new Observable ( undefined as any, options, this ); //TSC

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

  emit ( change: -1 | 1, fresh: boolean ): void {

    if ( change > 0 && !getCount ( this.status ) ) {

      this.observable.emit ( change, false );

    }

    super.emit ( change, fresh );

  }

  update ( fresh: boolean, first?: boolean ): void {

    if ( fresh && !this.observable.disposed && !this.observable.signal.disposed ) { // The resulting value might change

      const status = getExecution ( this.status );

      if ( status ) { // Currently executing or pending

        this.status = setExecution ( this.status, fresh ? 3 : max ( status, 2 ) );

        if ( status > 1 ) {

          this.observable.emit ( -1, false );

        }

      } else { // Currently sleeping

        this.status = setExecution ( this.status, 1 );

        this.dispose ();

        try {

          const value = this.wrap ( this.fn );

          this.postdispose ();

          if ( this.observable.disposed || this.observable.signal.disposed ) { // Maybe a memo disposed of itself via a root before returning, or caused itself to re-execute

            this.observable.emit ( -1, false );

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

          this.observable.emit ( -1, false );

        } finally {

          const status = getExecution ( this.status );

          this.status = setExecution ( status, 0 );

          if ( status > 1 ) {

            this.update ( status === 3 );

          } else if ( !this.observables ) { // It can never run again, freeing up some memory

            this.fn = NOOP as any; //TSC
            this.observable.dispose ();

          }

        }

      }

    } else { // The resulting value could/should not possibly change

      this.observable.emit ( -1, false );

    }

  }

}

/* EXPORT */

export default Memo;
