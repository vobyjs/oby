
/* IMPORT */

import {readable, writable} from '~/callable';
import {OWNER, SAMPLING} from '~/constants';
import batch from '~/methods/batch';
import computed from '~/methods/computed';
import Reaction from '~/objects/reaction';
import type {IObservable, IObserver, IComputed, EqualsFunction, ProduceFunction, SelectFunction, UpdateFunction, ObservableAbstract, ObservableReadonlyAbstract, ObservableReadonly, ObservableOptions, LazySet} from '~/types';

/* MAIN */

class Observable<T = unknown, TI = unknown> {

  /* VARIABLES */

  parent?: IComputed<any>;
  value: T | TI;
  disposed?: true;
  equals?: EqualsFunction<T, TI>;
  observers?: LazySet<IObserver>;

  /* CONSTRUCTOR */

  constructor ( value: T | TI, options?: ObservableOptions<T, TI>, parent?: IComputed<any> ) {

    this.value = value;

    if ( parent ) {

      this.parent = parent;

    }

    if ( options?.equals ) {

      this.equals = options.equals;

    }

  }

  /* REGISTRATION API */

  registerObserver ( observer: IObserver ): boolean {

    const {observers} = this;

    if ( observers ) {

      if ( observers instanceof Set ) {

        const sizePrev = observers.size;

        observers.add ( observer );

        const sizeNext = observers.size;

        return ( sizePrev !== sizeNext );

      } else if ( observers === observer ) {

        return false;

      } else {

        const observersNext = new Set<IObserver> ();

        observersNext.add ( observers );
        observersNext.add ( observer );

        this.observers = observersNext;

        return true;

      }

    } else {

      this.observers = observer;

      return true;

    }

  }

  registerSelf (): void {

    if ( this.disposed ) return;

    if ( !SAMPLING.current && OWNER.current instanceof Reaction ) {

      const isNewObserver = this.registerObserver ( OWNER.current );

      if ( isNewObserver ) {

        OWNER.current.registerObservable ( this as IObservable<any, any> ); //TSC

      }

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

  get (): T | TI {

    this.registerSelf ();

    return this.value;

  }

  sample (): T | TI {

    return this.value;

  }

  select <R> ( fn: SelectFunction<T | TI, R>, options?: ObservableOptions<R, R | undefined> ): ObservableReadonly<R> {

    const update = (): R => fn ( this.get () );

    return computed ( update, undefined, options );

  }

  set ( value: T ): T {

    if ( this.disposed ) throw new Error ( 'A disposed Observable can not be updated' );

    if ( batch.queue ) {

      batch.queue.set ( this, value );

      return value;

    } else {

      const equals = this.equals || Object.is;
      const fresh = !equals ( value, this.value );

      if ( !this.parent ) {

        this.stale ( fresh );

      }

      this.value = ( fresh ? value : this.value );

      this.unstale ( fresh );

      return value;

    }

  }

  produce ( fn: ProduceFunction<T | TI, T> ): T {

    //TODO: Implement this properly, with good performance and ~arbitrary values support (using immer?)

    const valueClone: T = JSON.parse ( JSON.stringify ( this.value ) );
    const valueResult = fn ( valueClone );
    const valueNext = ( valueResult === undefined ? valueClone : valueResult );

    return this.set ( valueNext );

  }

  update ( fn: UpdateFunction<T | TI, T> ): T {

    const valueNext = fn ( this.value );

    return this.set ( valueNext );

  }

  stale ( fresh: boolean ): void {

    if ( this.disposed ) return;

    const reactions = this.observers as LazySet<Reaction>; //TSC

    if ( reactions ) {

      if ( reactions instanceof Set ) {

        for ( const reaction of reactions ) {

          reaction.stale ( fresh );

        }

      } else {

        reactions.stale ( fresh );

      }

    }

  }

  unstale ( fresh: boolean ): void {

    if ( this.disposed ) return;

    const reactions = this.observers as LazySet<Reaction>; //TSC

    if ( reactions ) {

      if ( reactions instanceof Set ) {

        for ( const reaction of reactions ) {

          reaction.unstale ( fresh );

        }

      } else {

        reactions.unstale ( fresh );

      }

    }

  }

  readable (): ObservableReadonlyAbstract<T, TI> {

    return readable ( this );

  }

  writable (): ObservableAbstract<T, TI> {

    return writable ( this );

  }

  dispose (): void {

    this.disposed = true;

  }

}

/* EXPORT */

export default Observable;
