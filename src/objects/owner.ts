
/* IMPORT */

import {OBSERVER, OWNER, setObserver, setOwner} from '~/context';
import {castError} from '~/utils';
import type {IObserver, IOwner, IRoot, ISuspense, CleanupFunction, ErrorFunction, ObservedFunction, Callable, Contexts} from '~/types';

/* MAIN */

//TODO: roots are Sets
//TODO: signal prop
//TODO: lazy
//TODO: rename errorHandler
//TODO: test that disposal goes from right to left
//TODO: maybe renamed read->get write->set

class Owner {

  /* VARIABLES */

  parent?: IOwner;
  cleanups: Callable<CleanupFunction>[];
  contexts: Contexts;
  errorHandler?: Callable<ErrorFunction>;
  observers: IObserver[];
  roots: (IRoot | (() => IRoot[]))[];
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

    const {errorHandler} = this;

    if ( errorHandler ) {

      errorHandler.call ( errorHandler, error ); //UGLY: This assumes that the error handler won't throw, which we know, but Owner shouldn't know

      return true;

    } else {

      if ( this.parent?.catch ( error, true ) ) return true;

      if ( silent ) return false;

      // console.error ( error.stack ); // <-- Log "error.stack" to understand where the error happened

      throw error;

    }

  }

  dispose (): void {

    this.observers.reverse ().forEach ( observer => observer.dispose () );
    this.suspenses.reverse ().forEach ( suspense => suspense.dispose () );
    this.cleanups.reverse ().forEach ( cleanup => cleanup.call ( cleanup ) );

    this.cleanups = [];
    this.contexts = {};
    this.observers = [];
    this.suspenses = [];

  }

  read <T> ( symbol: symbol ): T | undefined {

    const {contexts, parent} = this;

    if ( symbol in contexts ) return contexts[symbol];

    return parent?.read<T> ( symbol );

  }

  write <T> ( symbol: symbol, value: T ): void {

    this.contexts ||= {};
    this.contexts[symbol] = value;

  }

  wrap <T> ( fn: ObservedFunction<T>, owner: IOwner, observer: IObserver | undefined ): T | undefined {

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

//TODO: REVIEW
