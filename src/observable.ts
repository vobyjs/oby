
/* IMPORT */

import Batch from './batch';
import Computed from './computed';
import Observer from './observer';
import Owner from './owner';
import {isArray, isSet, isUndefined} from './utils';
import {ComparatorFunction, ProduceFunction, UpdateFunction, ReadonlyObservableCallable, ObservableAny, ObservableOptions} from './types';

/* MAIN */

class Observable<T = unknown> {

  /* VARIABLES */

  private value: T;
  private observers?: Set<Observer> | Observer;
  private comparator?: ComparatorFunction<T, T>;
  private parent?: Computed<T, T>;

  /* CONSTRUCTOR */

  constructor ( value: T, options?: ObservableOptions<T, T>, parent?: Computed<T, T> ) {

    this.value = value;

    if ( options ) {

      if ( options.comparator ) {

        this.comparator = options.comparator;

      }

    }

    if ( parent ) {

      this.parent = parent;

    }

  }

  /* REGISTRATION API */

  hasObserver ( observer: Observer ): boolean {

    if ( !this.observers ) {

      return false;

    } else if ( isSet ( this.observers ) ) {

      return this.observers.has ( observer );

    } else {

      return this.observers === observer;

    }

  }

  registerObserver ( observer: Observer ): void {

    if ( !this.observers ) {

      this.observers = observer;

    } else if ( isSet ( this.observers ) ) {

      this.observers.add ( observer );

    } else if ( this.observers === observer ) {

      return;

    } else {

      const observerPrev = this.observers;

      this.observers = new Set ();

      this.observers.add ( observerPrev );
      this.observers.add ( observer );

    }

  }

  unregisterObserver ( observer: Observer ): void {

    if ( !this.observers ) {

      return;

    } else if ( isSet ( this.observers ) ) {

      this.observers.delete ( observer );

    } else if ( this.observers === observer ) {

      this.observers = undefined;

    }

  }

  registerSelf (): void {

    if ( this.parent ) {

      if ( !this.parent.dirty ) {

        this.parent.registerSelf ();

      } else {

        this.parent.update ();

      }

    } else {

      Owner.registerObservable ( this );

    }

  }

  /* API */

  get (): T {

    this.registerSelf ();

    return this.value;

  }

  sample (): T {

    return this.value;

  }

  set ( value: T ): T {

    const comparator = this.comparator || Object.is;

    if ( comparator ( value, this.value ) ) {

      return this.value;

    }

    if ( Batch.registerSet ( this, value ) ) {

      return value;

    } else {

      this.value = value;

      this.emit ();

      return value;

    }

  }

  produce ( fn: ProduceFunction<T> ): T { //TODO: Implement this properly, with good performance and ~arbitrary values support (using immer?)

    const valueClone = JSON.parse ( JSON.stringify ( this.value ) );
    const valueResult = fn ( valueClone );
    const valueNext = ( !isUndefined ( valueResult ) ? valueResult : valueClone ) as T; //TSC

    return this.set ( valueNext );

  }

  update ( fn: UpdateFunction<T> ): T {

    const valueNext = fn ( this.value );

    return this.set ( valueNext );

  }

  emit (): void {

    const {observers} = this;

    if ( !observers ) return;

    if ( isSet ( observers ) && !observers.size ) return;

    Owner.wrapWithout ( () => {

      if ( isSet ( observers ) ) {

        const queue = Array.from ( observers.values () );

        for ( let i = 0, l = queue.length; i < l; i++ ) {
          const observer = queue[i];
          observer.dirty = true; // Trip flag for checking for updates
        }

        for ( let i = 0, l = queue.length; i < l; i++ ) {
          const observer = queue[i];
          if ( !observer.dirty ) continue; // Trip flag flipped, already updated
          if ( !observers.has ( observer ) ) continue; // No longer an observer
          observer.update ();
        }

      } else {

        observers.update ();

      }

    });

  }

  on <U> ( fn: ( value: T ) => U ): ReadonlyObservableCallable<U>;
  on <U> ( fn: ( value: T ) => U, dependencies?: ObservableAny[] ): ReadonlyObservableCallable<U>;
  on <U> ( fn: ( value: T ) => U, options?: ObservableOptions<U, U | undefined>, dependencies?: ObservableAny[] ): ReadonlyObservableCallable<U>;
  on <U> ( fn: ( value: T ) => U, options?: ObservableAny[] | ObservableOptions<U, U | undefined>, dependencies?: ObservableAny[] ): ReadonlyObservableCallable<U> {

    if ( isArray ( options ) ) return this.on ( fn, undefined, options );

    const observable = Computed.wrap ( () => {

      this.get ();

      if ( dependencies ) dependencies.forEach ( observable => observable () );

      return Owner.wrapWithSampling ( fn.bind ( undefined, this.value ) );

    }, undefined, options );

    return observable as ReadonlyObservableCallable<U>; //TSC

  }

}

/* EXPORT */

export default Observable;
