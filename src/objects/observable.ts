
/* IMPORT */

import {DIRTY_YES, OBSERVER_DISPOSED, UNINITIALIZED} from '~/constants';
import {OBSERVER} from '~/context';
import Scheduler from '~/objects/scheduler.sync';
import {is, nope} from '~/utils';
import type {IObservableParent, IObserver, EqualsFunction, UpdateFunction, ObservableOptions} from '~/types';

/* MAIN */

class Observable<T = unknown> {

  /* VARIABLES */

  parent?: IObservableParent;
  value: T;
  equals?: EqualsFunction<T>;
  observers: Set<IObserver> = new Set ();

  /* CONSTRUCTOR */

  constructor ( value: T, options?: ObservableOptions<T>, parent?: IObservableParent ) {

    this.value = value;

    if ( parent ) {

      this.parent = parent;

    }

    if ( options?.equals !== undefined ) {

      this.equals = options.equals || nope;

    }

  }

  /* API */

  get (): T {

    if ( this.parent !== OBSERVER_DISPOSED ) {

      this.parent?.update ();

      OBSERVER?.link ( this );

    }

    return this.value;

  }

  set ( value: T ): T {

    const equals = this.equals || is;
    const fresh = ( this.value === UNINITIALIZED ) || !equals ( value, this.value );

    if ( !fresh ) return value;

    this.value = value;

    Scheduler.counter += 1;

    this.stale ( DIRTY_YES );

    Scheduler.counter -= 1;

    Scheduler.flush ();

    return value;

  }

  stale ( status: number ): void {

    for ( const observer of this.observers ) {

      if ( observer.sync ) {

        Scheduler.schedule ( observer );

      } else {

        observer.stale ( status );

      }

    }

  }

  update ( fn: UpdateFunction<T> ): T {

    const value = fn ( this.value );

    return this.set ( value );

  }

}

/* EXPORT */

export default Observable;
