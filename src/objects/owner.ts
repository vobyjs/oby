
/* IMPORT */

import {UNAVAILABLE} from '~/constants';
import {OBSERVER, OWNER, setObserver, setOwner} from '~/context';
import {lazyArrayEachRight} from '~/lazy';
import {castError} from '~/utils';
import type {IObserver, IOwner, IRoot, ISuspense, CleanupFunction, ErrorFunction, WrappedFunction, Callable, Contexts, LazyArray, LazySet, LazyValue} from '~/types';

/* MAIN */

//TODO: Throw when registering stuff after disposing, maybe

class Owner {

  /* VARIABLES */

  parent?: IOwner;
  cleanups: LazyArray<Callable<CleanupFunction>> = undefined;
  contexts: LazyValue<Contexts> = undefined;
  errorHandler?: Callable<ErrorFunction>;
  observers: LazyArray<IObserver> = undefined;
  roots: LazySet<IRoot | (() => IRoot[])> = undefined;
  suspenses: LazyArray<ISuspense> = undefined;

  /* API */

  catch ( error: Error, silent: boolean ): boolean {

    const {errorHandler} = this;

    if ( errorHandler ) {

      errorHandler.call ( errorHandler, error ); //TODO: This assumes that the error handler won't throw

      return true;

    } else {

      if ( this.parent?.catch ( error, true ) ) return true;

      if ( silent ) return false;

      // console.error ( error.stack ); // <-- Log "error.stack" to better understand where the error happened

      throw error;

    }

  }

  dispose ( deep: boolean ): void {

    lazyArrayEachRight ( this.observers, observer => observer.dispose ( true ) );
    lazyArrayEachRight ( this.suspenses, suspense => suspense.dispose ( true ) );
    lazyArrayEachRight ( this.cleanups, cleanup => cleanup.call ( cleanup ) );

    this.cleanups = undefined;
    this.contexts = undefined;
    this.observers = undefined;
    this.suspenses = undefined;

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
