
/* IMPORT */

import oby from '.';
import Context from './context';
import {IObservable, IFN, IDisposer, IListener} from './types';

/* MAIN */

class Observable<T = unknown> {

  /* VARIABLES */

  private disposer: IDisposer | undefined;
  private listeners: Set<IListener<T>> | undefined;
  private value: T;

  /* CONSTRUCTOR */

  constructor ( value: T, disposer?: IDisposer ) {

    this.disposer = disposer;
    this.listeners = undefined;
    this.value = value;

  }

  /* API */

  call (): T;
  call ( ...args: (T extends IFN ? [(( valuePrev: T ) => T)] : [T | (( valuePrev: T ) => T)]) ): T;
  call ( ...args: (T extends IFN ? [(( valuePrev: T ) => T)] | [] : [T | (( valuePrev: T ) => T)] | []) ): T {

    if ( !args.length ) return this.get ();

    const valueOrSetter = args[0];

    if ( typeof valueOrSetter === 'function' ) return this.set ( ( valueOrSetter as any )( this.value ) ); //TSC

    return this.set ( valueOrSetter );

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

    const listeners = this.listeners;

    if ( listeners ) {

      listeners.forEach ( listener => {

        listener ( this.value, valuePrev );

      });

    }

    return this.value;

  }

  on ( listener: IListener<T>, immediate: boolean = false ): void {

    this.listeners || ( this.listeners = new Set () );

    this.listeners.add ( listener );

    if ( immediate ) {

      listener ( this.value, undefined );

    }

  }

  off ( listener: IListener<T> ): void {

    if ( !this.listeners ) return;

    this.listeners.delete ( listener );

  }

  computed <U> ( fn: ( value: T ) => U, dependencies?: (IObservable | Observable)[] ): IObservable<U> {

    const listener = () => observable.set ( fn ( this.value ) );
    const disposer = () => this.off ( listener );
    const observable = oby ( fn ( this.value ), disposer );

    this.on ( listener );

    if ( dependencies ) {

      for ( let i = 0, l = dependencies.length; i < l; i++ ) {

        dependencies[i].on ( listener );

      }

    }

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
