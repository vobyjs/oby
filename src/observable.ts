
/* IMPORT */

import {SYMBOL} from './constants';
import Context from './context';
import {IObservable, IDisposer, IListener} from './types';

/* MAIN */

class Observable<T = unknown> {

  /* VARIABLES */

  private disposer: IDisposer | undefined;
  private listeners: IListener<T>[] | undefined;
  private value: T;

  /* CONSTRUCTOR */

  constructor ( value: T, disposer?: IDisposer ) {

    this.disposer = disposer;
    this.listeners = undefined;
    this.value = value;
    this[SYMBOL] = true;

  }

  /* STATIC API */

  static callable <T = unknown> ( value: T, disposer?: IDisposer ): IObservable<T> {

    return Observable.toCallable ( new Observable ( value, disposer ) );

  }

  static toCallable <T = unknown> ( observable: Observable<T> ): IObservable<T> {

    const callable = observable.call.bind ( observable );

    callable.get = observable.get.bind ( observable );
    callable.sample = observable.sample.bind ( observable );
    callable.set = observable.set.bind ( observable );
    callable.on = observable.on.bind ( observable );
    callable.off = observable.off.bind ( observable );
    callable.computed = fn => Observable.toCallable ( observable.computed ( fn ) );
    callable.dispose = observable.dispose.bind ( observable );
    callable[SYMBOL] = true;

    return callable;

  }

  /* PRIVATE API */

  private call (): T;
  private call ( ...args: [Exclude<T, Function> | (( valuePrev: T ) => T)] ): T;
  private call ( ...args: [Exclude<T, Function> | (( valuePrev: T ) => T)] | [] ): T {

    if ( !args.length ) return this.get ();

    if ( typeof args[0] === 'function' ) return this.set ( ( args[0] as any )( this.value ) ); //TSC

    return this.set ( args[0] );

  }

  /* PUBLIC API */

  public get (): T {

    Context.link ( this );

    return this.value;

  }

  public sample (): T {

    return this.value;

  }

  public set ( value: T ): T {

    const valuePrev = this.value;

    if ( Object.is ( value, valuePrev ) ) return valuePrev;

    this.value = value;

    const listeners = this.listeners;

    if ( listeners ) {

      for ( let i = 0, l = listeners.length; i < l; i++ ) {

        listeners[i]( this.value, valuePrev );

      }

    }

    return this.value;

  }

  public on ( listener: IListener<T>, immediate: boolean = false ): void {

    this.listeners || ( this.listeners = [] );

    const index = this.listeners.indexOf ( listener );

    if ( index < 0 ) {

      this.listeners.push ( listener );

    }

    if ( immediate ) {

      listener ( this.value, undefined );

    }

  }

  public off ( listener: IListener<T> ): void {

    if ( !this.listeners ) return;

    const index = this.listeners.indexOf ( listener );

    if ( index < 0 ) return;

    this.listeners = this.listeners.filter ( ( _, i ) => i !== index );

  }

  public computed <U> ( fn: ( value: T ) => U ): Observable<U> {

    const listener = ( value: T ) => observable.set ( fn ( value ) );
    const disposer = () => this.off ( listener );
    const observable = new Observable<U> ( fn ( this.value ), disposer );

    this.on ( listener );

    return observable;

  }

  public dispose (): void {

    if ( !this.disposer ) return;

    this.disposer ();

    this.disposer = undefined;

  }

}

/* EXPORT */

export default Observable;
