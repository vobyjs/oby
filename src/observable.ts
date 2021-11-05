
/* IMPORT */

import Callable from './callable';
import {NOOP} from './constants';
import Context from './context';
import {IDisposer, IListener} from './types';

/* MAIN */

class Observable<T> extends Callable {

  /* VARIABLES */

  private disposer: IDisposer;
  private listeners: Set<IListener<T>>;
  private value: T;

  /* CONSTRUCTOR */

  constructor ( value: T, disposer: IDisposer = NOOP ) {

    super ();

    this.disposer = disposer;
    this.listeners = new Set ();
    this.value = value;

  }

  /* API */

  __call__ (): T;
  __call__ ( ...args: [Exclude<T, Function> | (( valuePrev: T ) => T)] ): T;
  __call__ ( ...args: [Exclude<T, Function> | (( valuePrev: T ) => T)] | [] ): T {

    if ( !args.length ) return this.get ();

    if ( typeof args[0] === 'function' ) return this.set ( ( args[0] as any )( this.value ) ); //TSC

    return this.set ( args[0] );

  }

  get (): T {

    const context = Context.get ();

    if ( context ) {

      this.on ( context );

    }

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

  dispose (): void {

    this.disposer ();

    this.disposer = NOOP;

  }

}

/* EXPORT */

export default Observable;
