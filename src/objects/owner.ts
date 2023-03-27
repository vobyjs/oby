
/* IMPORT */

import {UNAVAILABLE} from '~/constants';
import {OBSERVER, OWNER, setObserver, setOwner} from '~/context';
import {lazyArrayEachRight} from '~/lazy';
import {castError} from '~/utils';
import type {IObserver, IOwner, IRoot, ISuspense, CleanupFunction, ErrorFunction, WrappedFunction, Callable, Contexts, LazyArray, LazySet} from '~/types';

/* MAIN */

class Owner {

  /* VARIABLES */

  parent?: IOwner;
  contexts?: Contexts;
  errorHandler?: Callable<ErrorFunction>;
  cleanups: LazyArray<Callable<CleanupFunction>>;
  observers: LazyArray<IObserver>;
  roots: LazySet<IRoot | (() => IRoot[])>;
  suspenses: LazyArray<ISuspense>;

  /* API */

  catch ( error: Error, silent: boolean ): boolean {

    const {errorHandler} = this;

    if ( errorHandler ) {

      errorHandler.call ( errorHandler, error ); //UGLY: This assumes that the error handler won't throw, which we know, but Owner shouldn't know

      return true;

    } else {

      if ( this.parent?.catch ( error, true ) ) return true;

      if ( silent ) return false;

      // console.error ( error.stack ); // <-- Log "error.stack" to better understand where the error happened

      throw error;

    }

  }

  dispose ( deep: boolean ): void {

    //TODO: Maybe write this more cleanly

    lazyArrayEachRight ( this.observers, observer => observer.dispose ( true ) );
    this.observers = [];
    lazyArrayEachRight ( this.suspenses, suspense => suspense.dispose ( true ) );
    this.suspenses = [];
    lazyArrayEachRight ( this.cleanups, cleanup => cleanup.call ( cleanup ) );
    this.cleanups = [];

    if ( this.contexts ) {
      this.contexts = {};
    }

  }

  get <T> ( symbol: symbol ): T | undefined {

    const {contexts, parent} = this;

    if ( contexts && symbol in contexts ) return contexts[symbol];

    return parent?.get<T> ( symbol );

  }

  set <T> ( symbol: symbol, value: T ): void {

    this.contexts ||= {};
    this.contexts[symbol] = value;

  }

  wrap <T> ( fn: WrappedFunction<T>, owner: IOwner, observer: IObserver | undefined ): T { //TODO: Maybe make this monomorphic

    const ownerPrev = OWNER;
    const observerPrev = OBSERVER;

    setOwner ( owner );
    setObserver ( observer );

    try {

      return fn ();

    } catch ( error: unknown ) {

      this.catch ( castError ( error ), false );

      return UNAVAILABLE; // Returning a value that is the least likely to cause bugs

    } finally {

      setOwner ( ownerPrev );
      setObserver ( observerPrev );

    }

  }

}

/* EXPORT */

export default Owner;
