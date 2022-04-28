
/* IMPORT */

import Observable from '~/objects/observable';
import Reaction from '~/objects/reaction';
import {castError, max} from '~/utils';
import type {IObservable, ComputedFunction, ObservableOptions} from '~/types';

/* MAIN */

class Computed<T = unknown> extends Reaction {

  /* VARIABLES */

  fn: ComputedFunction<T, T>;
  observable: IObservable<T>;

  /* CONSTRUCTOR */

  constructor ( fn: ComputedFunction<T, T>, valueInitial: T, options?: ObservableOptions<T> ) {

    super ();

    this.fn = fn;
    this.observable = new Observable ( valueInitial, options, this );

    this.parent.registerObserver ( this );

    this.update ( true );

  }

  /* API */

  dispose ( deep?: boolean, immediate?: boolean ): void {

    if ( deep ) {

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

  update ( fresh: boolean ): void {

    if ( fresh && !this.observable.disposed ) { // The resulting value might change

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

          const valuePrev = this.observable.value;
          const valueNext = this.wrap ( this.fn.bind ( undefined, valuePrev ) );

          this.postdispose ();

          if ( this.observable.disposed ) { // Maybe a computed disposed of itself via a root before returning, or caused itself to re-execute

            this.observable.unstale ( false );

          } else {

            this.observable.write ( valueNext );

          }

          if ( !this.observers && !this.observables && !this.cleanups ) { // Auto-disposable

            this.dispose ( true, true );

          }

        } catch ( error: unknown ) {

          this.postdispose ();

          this.error ( castError ( error ), false );

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

export default Computed;
