
/* IMPORT */

import {SYMBOL} from './constants';
import Context from './context';
import {IObservable, IDisposer, IListener} from './types';

/* MAIN */

class Observable<T = unknown> {

  /* VARIABLES */

  private disposer: IDisposer | undefined;
  private listeners: Set<IListener<T>>;
  private value: T;

  /* CONSTRUCTOR */

  constructor ( value: T, disposer?: IDisposer ) {

    this.disposer = disposer;
    this.listeners = new Set ();
    this.value = value;
    this[SYMBOL] = true;

  }

  /* STATIC API */

  static callable <T = unknown> ( value: T, disposer?: IDisposer ): IObservable<T> {

    const observable = new Observable ( value, disposer );

    const callable = observable.call.bind ( observable );

    callable.get = observable.get.bind ( observable );
    callable.sample = observable.sample.bind ( observable );
    callable.set = observable.set.bind ( observable );
    callable.on = observable.on.bind ( observable );
    callable.off = observable.off.bind ( observable );
    callable.computed = observable.computed.bind ( observable );
    callable.dispose = observable.dispose.bind ( observable );
    callable[SYMBOL] = true;

    return callable;

  }

  /* API */

  private call (): T;
  private call ( ...args: [Exclude<T, Function> | (( valuePrev: T ) => T)] ): T;
  private call ( ...args: [Exclude<T, Function> | (( valuePrev: T ) => T)] | [] ): T {

    if ( !args.length ) return this.get ();

    if ( typeof args[0] === 'function' ) return this.set ( ( args[0] as any )( this.value ) ); //TSC

    return this.set ( args[0] );

  }

  get (): T {

    Context.link ( this );

    return this.value;

  }

  sample (): T {

    return this.value;

  }

  set ( value: T ): T {

    const valuePrev = this.value;

    if ( Object.is ( value, valuePrev ) ) return valuePrev;

    this.value = value;

    for ( const listener of this.listeners ) {

      listener ( this.value, valuePrev );

    }

    return this.value;

  }

  on ( listener: IListener<T>, immediate: boolean = false ): void {

    this.listeners.add ( listener );

    if ( immediate ) {

      listener ( this.value, undefined );

    }

  }

  off ( listener: IListener<T> ): void {

    this.listeners.delete ( listener );

  }

  computed <U> ( fn: ( value: T ) => U ): IObservable<U> {

    const listener = ( value: T ) => observable.set ( fn ( value ) );
    const disposer = () => this.off ( listener );
    const observable = Observable.callable<U> ( fn ( this.value ), disposer );

    this.on ( listener );

    return observable;

  }

  dispose (): void {

    if ( !this.disposer ) return;

    this.disposer ();

    this.disposer = undefined;

  }

}

/* EXPORT */

export default Observable;
