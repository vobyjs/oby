
/* IMPORT */

import batch from './batch';
import Computed from './computed';
import Observer from './observer';
import Owner from './owner';
import {ComparatorFunction, ProduceFunction, SelectFunction, UpdateFunction, ObservableReadonly, ObservableOptions} from './types';

/* MAIN */

class Observable<T = unknown> {

  /* VARIABLES */

  public disposed: boolean;
  public value: T;
  public listeners: number;
  public listenedValue: any;
  private comparator?: ComparatorFunction<T, T>;
  private observers?: Set<Observer> | Observer;
  private parent?: Computed;

  /* CONSTRUCTOR */

  constructor ( value: T, options?: ObservableOptions<T, T>, parent?: Computed ) {

    this.disposed = false;
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

  registerObserver ( observer: Observer ): boolean {

    if ( !this.observers ) {

      this.observers = observer;

      return true;

    } else if ( this.observers instanceof Set ) {

      const sizePrev = this.observers.size;

      this.observers.add ( observer );

      const sizeNext = this.observers.size;

      return ( sizePrev !== sizeNext );

    } else if ( this.observers === observer ) {

      return false;

    } else {

      const observerPrev = this.observers;

      this.observers = new Set ();

      this.observers.add ( observerPrev );
      this.observers.add ( observer );

      return true;

    }

  }

  unregisterObserver ( observer: Observer ): void {

    if ( !this.observers ) {

      return;

    } else if ( this.observers instanceof Set ) {

      this.observers.delete ( observer );

    } else if ( this.observers === observer ) {

      this.observers = undefined;

    }

  }

  registerSelf (): void {

    if ( this.disposed ) return;

    Owner.registerObservable ( this );

    if ( this.parent && this.parent.staleCount ) {

      const fresh = this.parent.staleFresh;

      this.parent.staleCount = 0;
      this.parent.staleFresh = false;

      this.parent.update ( fresh );

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

  select <R> ( fn: SelectFunction<T, R>, options?: ObservableOptions<R, R> ): ObservableReadonly<R> {

    return Computed.wrap ( () => {

      return fn ( this.get () );

    }, undefined, options );

  }

  set ( value: T ): T {

    if ( this.disposed ) throw new Error ( 'A disposed Observable can not be updated' );

    if ( batch.queue ) {

      batch.queue.set ( this, value );

      return value;

    } else {

      const comparator = this.comparator || Object.is;
      const fresh = !comparator ( value, this.value );

      if ( !this.parent ) {

        this.emitStale ( fresh );

      }

      this.value = ( fresh ? value : this.value );

      this.emitUnstale ( fresh );

      return this.value;

    }

  }

  produce ( fn: ProduceFunction<T> ): T { //TODO: Implement this properly, with good performance and ~arbitrary values support (using immer?)

    const valueClone: T = JSON.parse ( JSON.stringify ( this.value ) );
    const valueResult = fn ( valueClone );
    const valueNext = ( valueResult === undefined ? valueClone : valueResult );

    return this.set ( valueNext );

  }

  update ( fn: UpdateFunction<T> ): T {

    const valueNext = fn ( this.value );

    return this.set ( valueNext );

  }

  emit ( fresh: boolean ): void {

    this.emitStale ( fresh );
    this.emitUnstale ( fresh );

  }

  emitStale ( fresh: boolean ): void {

    if ( this.disposed ) return;

    if ( !this.observers ) {

      return;

    } else if ( this.observers instanceof Set ) {

      for ( const observer of this.observers ) {

        observer.onStale ( fresh );

      }

    } else {

      this.observers.onStale ( fresh );

    }

  }

  emitUnstale ( fresh: boolean ): void {

    if ( this.disposed ) return;

    if ( !this.observers ) {

      return;

    } else if ( this.observers instanceof Set ) {

      //TODO: Maybe clone the queue, though all tests are passing already

      for ( const observer of this.observers ) {

        observer.onUnstale ( fresh );

      }

    } else {

      this.observers.onUnstale ( fresh );

    }

  }

  dispose (): void {

    this.disposed = true;

  }

}

/* EXPORT */

export default Observable;
