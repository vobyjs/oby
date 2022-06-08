
/* IMPORT */

import {BATCH, FALSE, IS, OWNER, ROOT, SAMPLING} from '~/constants';
import {lazySetAdd, lazySetDelete, lazySetHas} from '~/lazy';
import Computation from '~/objects/computation';
import type {IComputation, IComputed, IObservable, IObserver, EqualsFunction, ListenerFunction, UpdateFunction, ObservableOptions, Callable, LazySet, Signal} from '~/types';

/* MAIN */

class Observable<T = unknown> {

  /* VARIABLES */

  parent?: IComputed<T>;
  signal: Signal = OWNER.current.signal || ROOT.current;
  value: T;
  disposed?: true;
  equals?: EqualsFunction<T>;
  listeners?: LazySet<Callable<ListenerFunction<T>>>;
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

  registerListener ( listener: Callable<ListenerFunction<T>> ): void {

    listener.call ( listener, this.value );

    if ( lazySetHas ( this.listeners, listener ) ) return;

    lazySetAdd ( this, 'listeners', listener );

  }

  registerObserver ( observer: IObserver ): void {

    lazySetAdd ( this, 'observers', observer );

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

  unregisterListener ( listener: Callable<ListenerFunction<T>> ): void {

    lazySetDelete ( this, 'listeners', listener );

  }

  unregisterObserver ( observer: IObserver ): void {

    lazySetDelete ( this, 'observers', observer );

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

        const valuePrev = this.value;

        this.value = value;

        this.listened ( valuePrev );

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

  listened ( valuePrev?: T ): void {

    if ( this.disposed || this.signal.disposed ) return;

    const {listeners} = this;

    if ( listeners ) {

      if ( listeners instanceof Set ) {

        for ( const listener of listeners ) {

          listener.call ( listener, this.value, valuePrev );

        }

      } else {

        listeners.call ( listeners, this.value, valuePrev );

      }

    }

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
