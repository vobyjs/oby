
/* IMPORT */

import {get, set} from 'path-prop';
import oby from '.';
import batch from './batch';
import Context from './context';
import {GetPath, GetPathValue, IObservable, IFN, IDisposer, IListener} from './types';

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

    Context.link ( this as any ); //TSC

    return this.value;

  }

  sample (): T {

    return this.value;

  }

  set ( value: T ): T {

    const valuePrev = this.value;

    if ( Object.is ( value, valuePrev ) ) return valuePrev;

    this.value = value;

    this.emit ( valuePrev );

    return this.value;

  }

  update <P extends GetPath<T>> ( path: P, value: GetPathValue<T, P> ): GetPathValue<T, P> { //FIXME: This only works for JSON-serializable values, as we can't clone other values yet

    if ( typeof path !== 'string' ) throw new Error ( 'path must be a string' );

    const valuePrev = get ( this.value, path );

    if ( Object.is ( value, valuePrev ) ) return valuePrev;

    const valueClone = JSON.parse ( JSON.stringify ( this.value ) );

    set ( valueClone, path, value );

    this.set ( valueClone );

    return value;

  }

  emit ( valuePrev?: T ): void {

    if ( !this.listeners ) return;

    if ( batch.queue.isActive () ) {

      batch.queue.push ( this, valuePrev );

    } else {

      this.listeners.forEach ( listener => {

        listener ( this.value, valuePrev );

      });

    }

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
