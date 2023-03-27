
/* IMPORT */

import {DIRTY_YES} from '~/constants';
import {OBSERVER} from '~/context';
import Scheduler from '~/objects/scheduler.sync';
import {SYMBOL_VALUE_INITIAL} from '~/symbols';
import {is, nope} from '~/utils';
import type {IObserver, IMemo, EqualsFunction, UpdateFunction, ObservableOptions} from '~/types';

/* MAIN */

class Observable<T = unknown> {

  /* VARIABLES */

  parent?: IMemo<T>;
  value: T;
  equals?: EqualsFunction<T>;
  observers: Set<IObserver> = new Set ();

  /* CONSTRUCTOR */

  constructor ( value: T, options?: ObservableOptions<T>, parent?: IMemo<T> ) {

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

    this.parent?.update ();

    OBSERVER?.link ( this );

    return this.value;

  }

  set ( value: T ): T {

    const equals = this.equals || is;
    const fresh = ( this.value === SYMBOL_VALUE_INITIAL ) || !equals ( value, this.value );

    if ( !fresh ) return value;

    this.value = value;

    Scheduler.counter += 1;

    this.stale ( DIRTY_YES );

    Scheduler.counter -= 1;

    Scheduler.flush ();

    return value;

  }

  stale ( status: 2 | 3 ): void {

    for ( const observer of this.observers ) {

      if ( observer.sync ) {

        Scheduler.push ( observer );

      } else {

        observer.stale ( status );

      }

    }

  }

  update ( fn: UpdateFunction<T> ): T {

    const valueNext = fn ( this.value );

    return this.set ( valueNext );

  }

}

/* EXPORT */

export default Observable;
