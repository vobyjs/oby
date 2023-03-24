
/* IMPORT */

import {DIRTY_YES} from '~/constants';
import {OBSERVER} from '~/context';
import {is, nope} from '~/utils';
import type {IObserver, IMemo, EqualsFunction, UpdateFunction, ObservableOptions} from '~/types';

/* MAIN */

//TODO: signal prop
//TODO: direct listeners prop

class Observable<T = unknown> {

  /* VARIABLES */

  parent?: IMemo<T>;
  value: T;
  equals: EqualsFunction<T>;
  observers: Set<IObserver>;

  /* CONSTRUCTOR */

  constructor ( value: T, options?: ObservableOptions<T>, parent?: IMemo<T> ) {

    this.parent = parent;
    this.value = value;
    this.equals = is;
    this.observers = new Set ();

    if ( options?.equals !== undefined ) {

      this.equals = options.equals || nope;

    }

  }

  /* API */

  stale ( status: 2 | 3 ): void {

    this.observers.forEach ( observer => observer.stale ( status ) );

  }

  read (): T {

    OBSERVER?.link ( this );

    this.parent?.update ();

    return this.value;

  }

  write ( value: T ): T {

    const fresh = !this.equals ( value, this.value );

    if ( !fresh ) return value;

    this.stale ( DIRTY_YES );

    this.value = value;

    return value;

  }

  update ( fn: UpdateFunction<T> ): T {

    const valueNext = fn ( this.value );

    return this.write ( valueNext );

  }

}

/* EXPORT */

export default Observable;
