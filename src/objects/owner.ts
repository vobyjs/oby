
/* IMPORT */

import {OBSERVER, OWNER, setObserver, setOwner} from '~/context';
import {castError} from '~/utils';
import type {IObserver, IOwner, IRoot, ISuspense, CleanupFunction, ErrorFunction, ObservedFunction, Callable, Contexts} from '~/types';

/* MAIN */

//TODO: signal prop
//TODO: roots prop

class Owner {

  /* VARIABLES */

  parent?: IOwner;
  cleanups: Callable<CleanupFunction>[];
  contexts: Contexts;
  errorHandler?: ErrorFunction;
  observers: IObserver[];
  roots: IRoot[];
  suspenses: ISuspense[];

  /* CONSTRUCTOR */

  constructor () {

    this.cleanups = [];
    this.contexts = {};
    this.observers = [];
    this.roots = [];
    this.suspenses = [];

  }

  /* API */

  catch ( error: Error, silent: boolean ): boolean {

    if ( this.errorHandler ) {

      this.errorHandler ( error ); //TODO: This assumes the error handler will never throw, which from the point of view of Owner we can't really know

      return true;

    } else {

      if ( this.parent?.catch ( error, true ) ) return true;

      if ( silent ) return false;

      // console.error ( error.stack ); // <-- Log "error.stack" to understand where the error happened

      throw error;

    }

  }

  dispose (): void {

    this.observers.forEach ( observer => observer.dispose () );
    this.cleanups.reverse ().forEach ( cleanup => cleanup.call ( cleanup ) );

    this.cleanups = [];
    this.contexts = {};
    this.observers = [];

  }

  read <T> ( symbol: symbol ): T | undefined {

    const {contexts, parent} = this;

    if ( symbol in contexts ) return contexts[symbol];

    return parent?.read<T> ( symbol );

  }

  write <T> ( symbol: symbol, value: T ): void {

    this.contexts[symbol] = value;

  }

  wrap <T> ( fn: ObservedFunction<T>, owner: IOwner, observer: IObserver | undefined ): T {

    const ownerPrev = OWNER;
    const observerPrev = OBSERVER;

    setOwner ( owner );
    setObserver ( observer );

    try {

      return fn ();

    } catch ( error: unknown ) {

      this.catch ( castError ( error ), false );

    } finally {

      setOwner ( ownerPrev );
      setObserver ( observerPrev );

    }

  }

}

/* EXPORT */

export default Owner;
