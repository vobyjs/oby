
/* IMPORT */

import Observable from '~/objects/observable';
import Reaction from '~/objects/reaction';
import type {IObservable, ComputedFunction, ObservableOptions} from '~/types';

/* MAIN */

class Computed<T = unknown> extends Reaction {

  /* VARIABLES */

  fn: ComputedFunction<T, T | undefined>;
  observable: IObservable<T, T | undefined>;
  iteration: number = 0;

  /* CONSTRUCTOR */

  constructor ( fn: ComputedFunction<T, T | undefined>, valueInitial?: T, options?: ObservableOptions<T, T | undefined> ) {

    super ();

    this.fn = fn;
    this.observable = new Observable ( valueInitial, options, this );

    this.parent.registerObserver ( this );

    this.update ( true );

  }

  /* API */

  dispose ( deep?: boolean ): void {

    if ( deep ) {

      this.observable.dispose ();

    }

    super.dispose ( deep );

  }

  stale ( fresh: boolean ): void {

    if ( !this.statusCount ) {

      this.observable.stale ( false );

    }

    super.stale ( fresh );

  }

  update ( fresh: boolean ): void {

    if ( fresh && !this.observable.disposed ) { // The resulting value might change

      this.dispose ();

      try {

        const lock = ( this.iteration += 1 );
        const valuePrev = this.observable.value;
        const valueNext = this.wrap ( this.fn.bind ( undefined, valuePrev ) );

        if ( this.observable.disposed || lock !== this.iteration ) { // Maybe a computed disposed of itself via a root before returning, or caused itself to re-execute

          this.observable.unstale ( false );

        } else {

          this.observable.set ( valueNext );

        }

        if ( !this.observers && !this.observables && !this.cleanups ) { // Auto-disposable

          this.dispose ( true );

        }

      } catch ( error: unknown ) {

        this.iteration -= 1;

        this.error ( error, false );

        this.observable.unstale ( false );

      }

    } else { // The resulting value could/should not possibly change

      this.observable.unstale ( false );

    }

  }

}

/* EXPORT */

export default Computed;
