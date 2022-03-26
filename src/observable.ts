
/* IMPORT */

import batch from './batch';
import Computed from './computed';
import Observer from './observer';
import Owner from './owner';
import {ComparatorFunction, ProduceFunction, SelectFunction, UpdateFunction, ObservableReadonly, ObservableOptions} from './types';

/* MAIN */

//FIXME: The list of observers can't be allowed to grow endlessly potentially in some cases, it must get cleared up at idle times or something

class Observable<T = unknown> {

  /* VARIABLES */

  public value: T;
  public listeners: number;
  public listenedValue: any;
  private comparator?: ComparatorFunction<T, T>;
  private observers?: Set<Observer> | Observer;
  private parent?: Observer;

  /* CONSTRUCTOR */

  constructor ( value: T, options?: ObservableOptions<T, T>, parent?: Observer ) {

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

  select <R> ( fn: SelectFunction<T, R>, options?: ObservableOptions<R, R> ): ObservableReadonly<R> {

    return Computed.wrap ( () => {

      return fn ( this.get () );

    }, undefined, options );

  }

  set ( value: T ): T {

    const comparator = this.comparator || Object.is;

    if ( comparator ( value, this.value ) ) {

      return this.value;

    }

    if ( batch.queue ) {

      batch.queue.set ( this, value );

      return value;

    } else {

      this.value = value;

      this.emit ();

      return value;

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

  emit (): void {

    const {observers} = this;

    if ( !observers ) return;

    const isSet = ( observers instanceof Set );

    if ( isSet && !observers.size ) return;

    Owner.wrapWith ( () => {

      if ( isSet ) {

        if ( observers.size === 1 ) {

          for ( const observer of observers.keys () ) {
            if ( observer.destroyed ) {
              observers.delete ( observer );
            } else {
              observer.update ();
            }
            break;
          }

        } else {

          const queue: Observer[] = [];

          for ( const observer of observers.keys () ) {
            if ( observer.destroyed ) {
              observers.delete ( observer );
            } else {
              queue.push ( observer );
              observer.dirty = true; // Trip flag for checking for updates
            }
          }

          for ( let i = 0, l = queue.length; i < l; i++ ) {
            const observer = queue[i];
            if ( !observer.dirty ) continue; // Trip flag flipped, already updated
            if ( !observers.has ( observer ) ) continue; // No longer an observer
            if ( observer.destroyed ) {
              observers.delete ( observer );
            } else {
              observer.update ();
            }
          }

        }

      } else {

        if ( observers.destroyed ) {
          this.observers = undefined;
        } else {
          observers.update ();
        }

      }

    });

  }

}

/* EXPORT */

export default Observable;
