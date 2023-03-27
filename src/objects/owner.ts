
/* IMPORT */

import {UNAVAILABLE} from '~/constants';
import {OBSERVER, OWNER, setObserver, setOwner} from '~/context';
import {PoolOwnerCleanups, PoolOwnerObservers, PoolOwnerSuspenses} from '~/objects/pool';
import {castError} from '~/utils';
import type {IObserver, IOwner, ErrorFunction, WrappedFunction, Callable, Contexts} from '~/types';

/* MAIN */

class Owner {

  /* VARIABLES */

  parent?: IOwner;
  contexts?: Contexts;
  errorHandler?: Callable<ErrorFunction>;
  // cleanups: PoolArray<Callable<CleanupFunction>>;
  // observers: PoolArray<IObserver>;
  // roots: PoolSet<IRoot | (() => IRoot[])>;
  // suspenses: PoolArray<ISuspense>;

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

    if ( deep ) {

      PoolOwnerObservers.forEachRightAndDelete ( this, observer => observer.dispose ( true ) );
      PoolOwnerSuspenses.forEachRightAndDelete ( this, suspense => suspense.dispose ( true ) );
      PoolOwnerCleanups.forEachRightAndDelete ( this, cleanup => cleanup.call ( cleanup ) );

      if ( this.contexts ) {
        this.contexts = {};
      }

    } else {

      PoolOwnerObservers.forEachRightAndReset ( this, observer => observer.dispose ( true ) );
      PoolOwnerSuspenses.forEachRightAndReset ( this, suspense => suspense.dispose ( true ) );
      PoolOwnerCleanups.forEachRightAndReset ( this, cleanup => cleanup.call ( cleanup ) );

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
