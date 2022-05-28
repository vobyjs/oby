
/* IMPORT */

import {BATCH, FALSE, IS, OWNER, ROOT, SAMPLING} from '~/constants';
import Computation from '~/objects/computation';
import type {IComputation, IComputed, IObservable, IObserver, ISignal, EqualsFunction, UpdateFunction, ObservableOptions, LazySet} from '~/types';

/* MAIN */

class Observable<T = unknown> {

  /* VARIABLES */

  parent?: IComputed<T>;
  signal: ISignal = OWNER.current.signal || ROOT.current.signal;
  value: T;
  disposed?: true;
  equals?: EqualsFunction<T>;
  observers?: LazySet<IObserver>;

  /* CONSTRUCTOR */

  constructor ( value: T, options?: ObservableOptions<T>, parent?: IComputed<T> ) {

    this.value = value;

    if ( parent ) {

      this.parent = parent;

    }

    if ( options?.equals !== undefined ) {

      this.equals = options.equals || FALSE;

    }

  }

  /* REGISTRATION API */

  registerObserver ( observer: IObserver ): void {

    const {observers} = this;

    if ( observers ) {

      if ( observers instanceof Set ) {

        observers.add ( observer );

      } else if ( observers !== observer ) {

        const observersNext = new Set<IObserver> ();

        observersNext.add ( observers );
        observersNext.add ( observer );

        this.observers = observersNext;

      }

    } else {

      this.observers = observer;

    }

  }

  registerSelf (): void {

    if ( this.disposed || this.signal.disposed ) return;

    if ( !SAMPLING.current && OWNER.current instanceof Computation ) {

      this.registerObserver ( OWNER.current );

      OWNER.current.registerObservable ( this as IObservable<any> ); //TSC

    }

    if ( this.parent?.statusCount ) { // Potentially stale value, forcing a refresh

      this.parent.statusCount = 0;
      this.parent.statusFresh = false;

      this.parent.update ( true );

    }

  }

  unregisterObserver ( observer: IObserver ): void {

    const {observers} = this;

    if ( observers ) {

      if ( observers instanceof Set ) {

        observers.delete ( observer );

      } else if ( observers === observer ) {

        this.observers = undefined;

      }

    }

  }

  /* API */

  read (): T {

    this.registerSelf ();

    return this.value;

  }

  write ( value: T ): T {

    if ( this.disposed ) throw new Error ( 'A disposed Observable can not be updated' );

    if ( BATCH.current ) {

      BATCH.current.set ( this, value );

      return value;

    } else {

      const equals = this.equals || IS;
      const fresh = !equals ( value, this.value );

      if ( !this.parent ) {

        if ( !fresh ) return value;

        if ( !this.signal.disposed ) {

          this.stale ( fresh );

        }

      }

      if ( fresh ) {

        this.value = value;

      }

      if ( !this.signal.disposed ) {

        this.unstale ( fresh );

      }

      return value;

    }

  }

  update ( fn: UpdateFunction<T> ): T {

    const valueNext = fn ( this.value );

    return this.write ( valueNext );

  }

  stale ( fresh: boolean ): void {

    if ( this.disposed || this.signal.disposed ) return;

    const computations = this.observers as LazySet<IComputation>; //TSC

    if ( computations ) {

      if ( computations instanceof Set ) {

        for ( const computation of computations ) {

          computation.stale ( fresh );

        }

      } else {

        computations.stale ( fresh );

      }

    }

  }

  unstale ( fresh: boolean ): void {

    if ( this.disposed || this.signal.disposed ) return;

    const computations = this.observers as LazySet<IComputation>; //TSC

    if ( computations ) {

      if ( computations instanceof Set ) {

        for ( const computation of computations ) {

          computation.unstale ( fresh );

        }

      } else {

        computations.unstale ( fresh );

      }

    }

  }

  dispose (): void {

    this.disposed = true;

  }

}

/* EXPORT */

export default Observable;
