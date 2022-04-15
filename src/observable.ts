
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
  private computeds?: Set<Observer> | Observer;
  private effects?: Set<Observer> | Observer;
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

    if ( observer instanceof Computed ) {

      return this.registerObserverComputed ( observer );

    } else {

      return this.registerObserverEffect ( observer );

    }

  }

  registerObserverComputed ( observer: Observer ): boolean {

    if ( !this.computeds ) {

      this.computeds = observer;

      return true;

    } else if ( this.computeds instanceof Set ) {

      const sizePrev = this.computeds.size;

      this.computeds.add ( observer );

      const sizeNext = this.computeds.size;

      return ( sizePrev !== sizeNext );

    } else if ( this.computeds === observer ) {

      return false;

    } else {

      const observerPrev = this.computeds;

      this.computeds = new Set ();

      this.computeds.add ( observerPrev );
      this.computeds.add ( observer );

      return true;

    }

  }

  registerObserverEffect ( observer: Observer ): boolean {

    if ( !this.effects ) {

      this.effects = observer;

      return true;

    } else if ( this.effects instanceof Set ) {

      const sizePrev = this.effects.size;

      this.effects.add ( observer );

      const sizeNext = this.effects.size;

      return ( sizePrev !== sizeNext );

    } else if ( this.effects === observer ) {

      return false;

    } else {

      const observerPrev = this.effects;

      this.effects = new Set ();

      this.effects.add ( observerPrev );
      this.effects.add ( observer );

      return true;

    }

  }

  unregisterObserver ( observer: Observer ): void {

    if ( observer instanceof Computed ) {

      return this.unregisterObserverComputed ( observer );

    } else {

      return this.unregisterObserverEffect ( observer );

    }

  }

  unregisterObserverComputed ( observer: Observer ): void {

    if ( !this.computeds ) {

      return;

    } else if ( this.computeds instanceof Set ) {

      this.computeds.delete ( observer );

    } else if ( this.computeds === observer ) {

      this.computeds = undefined;

    }

  }

  unregisterObserverEffect ( observer: Observer ): void {

    if ( !this.effects ) {

      return;

    } else if ( this.effects instanceof Set ) {

      this.effects.delete ( observer );

    } else if ( this.effects === observer ) {

      this.effects = undefined;

    }

  }

  registerSelf (): void {

    if ( this.disposed ) return;

    Owner.registerObservable ( this );

    if ( this.parent && this.parent.staleCount ) { //FIXME: This is probably buggy, if it's refreshed early and the counter is reset it may not update itself when one of its dependencies change

      this.parent.staleCount = 0;
      this.parent.staleFresh = false;

      this.parent.update ( true );

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

    this.emitStaleComputeds ( fresh );
    this.emitStaleEffects ( fresh );

  }

  emitStaleComputeds ( fresh: boolean ): void {

    if ( !this.computeds ) {

      return;

    } else if ( this.computeds instanceof Set ) {

      for ( const observer of this.computeds ) {

        observer.onStale ( fresh );

      }

    } else {

      this.computeds.onStale ( fresh );

    }

  }

  emitStaleEffects ( fresh: boolean ): void {

    if ( !this.effects ) {

      return;

    } else if ( this.effects instanceof Set ) {

      for ( const observer of this.effects ) {

        observer.onStale ( fresh );

      }

    } else {

      this.effects.onStale ( fresh );

    }

  }

  emitUnstale ( fresh: boolean ): void {

    if ( this.disposed ) return;

    this.emitUnstaleComputeds ( fresh );
    this.emitUnstaleEffects ( fresh );

  }

  emitUnstaleComputeds ( fresh: boolean ): void {

    if ( !this.computeds ) {

      return;

    } else if ( this.computeds instanceof Set ) {

      //TODO: Maybe clone the queue, though all tests are passing already

      for ( const observer of this.computeds ) {

        observer.onUnstale ( fresh );

      }

    } else {

      this.computeds.onUnstale ( fresh );

    }

  }

  emitUnstaleEffects ( fresh: boolean ): void {

    if ( !this.effects ) {

      return;

    } else if ( this.effects instanceof Set ) {

      //TODO: Maybe clone the queue, though all tests are passing already

      for ( const observer of this.effects ) {

        observer.onUnstale ( fresh );

      }

    } else {

      this.effects.onUnstale ( fresh );

    }

  }

  dispose (): void {

    this.disposed = true;

  }

}

/* EXPORT */

export default Observable;
