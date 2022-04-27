
/* IMPORT */

import {BATCH, FALSE, NOOP, OWNER, SAMPLING, SYMBOL} from '~/constants';
import Reaction from '~/objects/reaction';
import {isFunction} from '~/utils';
import type {IObservable, IObserver, IComputed, EqualsFunction, UpdateFunction, Observable as ObservableWritable, ObservableReadonly, ObservableOptions, LazySet} from '~/types';

/* MAIN */

class Observable<T = unknown> {

  /* VARIABLES */

  parent?: IComputed<T>;
  value: T;
  disposed?: true;
  readonly?: true;
  equals?: EqualsFunction<T>;
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

      if ( isNewObserver || !OWNER.current.observables ) {

        OWNER.current.registerObservable ( this as IObservable<any> ); //TSC

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

  /* PROXY API */

  get ( target: any, property: string | symbol | number ): true | undefined {

    if ( property === SYMBOL ) return true;

  }

  apply ( target: any, thisArg: any, args: [UpdateFunction<T>] | [T] | [] ): T {

    if ( !args.length ) return this.read ();

    if ( this.readonly ) throw new Error ( 'A readonly Observable can not be updated' );

    return this.write ( args[0] );

  }

  readable (): ObservableReadonly<T> {

    this.readonly = true;

    return new Proxy ( NOOP, this );

  }

  writable (): ObservableWritable<T> {

    return new Proxy ( NOOP, this );

  }

  /* API */

  read (): T {

    this.registerSelf ();

    return this.value;

  }

  write ( fn: UpdateFunction<T> | T ): T {

    if ( this.disposed ) throw new Error ( 'A disposed Observable can not be updated' );

    const value = ( isFunction ( fn ) ? fn ( this.value ) : fn ) as T; //TSC

    if ( BATCH.current ) {

      BATCH.current.set ( this, value );

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

  dispose (): void {

    this.disposed = true;

  }

}

/* EXPORT */

export default Observable;
