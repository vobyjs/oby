
/* IMPORT */

import {DIRTY_YES} from '~/constants';
import {OBSERVER} from '~/context';
import {SYMBOL_VALUE_INITIAL} from '~/symbols';
import {is, nope} from '~/utils';
import type {IObserver, IMemo, EqualsFunction, UpdateFunction, ObservableOptions} from '~/types';

/* MAIN */

//TODO: signal prop
//TODO: disposing
//TODO: direct listeners prop
//TODO: read -> get, write -> set
//TODO: lazy
//TODO: direct listeners? it's potentially problematic though
//TODO: signal prop

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

  read (): T {

    this.parent?.update ();

    OBSERVER?.link ( this );

    return this.value;

  }

  write ( value: T ): T {

    const fresh = ( this.value === SYMBOL_VALUE_INITIAL ) || !this.equals ( value, this.value );

    if ( !fresh ) return value;

    this.value = value;

    this.stale ( DIRTY_YES );

    return value;

  }

  stale ( status: 2 | 3 ): void {

    [...this.observers].forEach ( observer => observer.stale ( status ) ); //TODO: cloning is needed for sync calling, maybe we can do it differently

  }

  update ( fn: UpdateFunction<T> ): T {

    const valueNext = fn ( this.value );

    return this.write ( valueNext );

  }

}

/* EXPORT */

export default Observable;

//TODO: REVIEW
