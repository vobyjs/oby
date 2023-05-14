
/* IMPORT */

import {UNAVAILABLE} from '~/constants';
import {OBSERVER, OWNER, setObserver, setOwner} from '~/context';
import {lazyArrayEachRight} from '~/lazy';
import {castError} from '~/utils';
import type {SYMBOL_SUSPENSE} from '~/symbols';
import type {IContext, IObserver, IOwner, IRoot, ISuperRoot, ISuspense, CleanupFunction, ErrorFunction, WrappedFunction, Callable, Contexts, LazyArray, LazySet, LazyValue} from '~/types';

/* HELPERS */

const onCleanup = ( cleanup: Callable<CleanupFunction> ): void => cleanup.call ( cleanup );
const onDispose = ( owner: IOwner ): void => owner.dispose ( true );

/* MAIN */

//TODO: Throw when registering stuff after disposing, maybe

class Owner {

  /* VARIABLES */

  parent?: IOwner;
  context?: Contexts;
  disposed: boolean = false;
  cleanups: LazyArray<Callable<CleanupFunction>> = undefined;
  errorHandler: LazyValue<ErrorFunction> = undefined;
  contexts: LazyArray<IContext> = undefined;
  observers: LazyArray<IObserver> = undefined;
  roots: LazySet<IRoot | (() => IRoot[])> = undefined;
  suspenses: LazyArray<ISuspense> = undefined;

  /* API */

  catch ( error: Error, silent: boolean ): boolean {

    const {errorHandler} = this;

    if ( errorHandler ) {

      errorHandler ( error ); //TODO: This assumes that the error handler won't throw immediately, which we know, but Owner shouldn't know

      return true;

    } else {

      if ( this.parent?.catch ( error, true ) ) return true;

      if ( silent ) return false;

      // console.error ( error.stack ); // <-- Log "error.stack" to better understand where the error happened

      throw error;

    }

  }

  dispose ( deep: boolean ): void {

    lazyArrayEachRight ( this.contexts, onDispose );
    lazyArrayEachRight ( this.observers, onDispose );
    lazyArrayEachRight ( this.suspenses, onDispose );
    lazyArrayEachRight ( this.cleanups, onCleanup );

    this.cleanups = undefined;
    this.disposed = deep;
    this.errorHandler = undefined;
    this.observers = undefined;
    this.suspenses = undefined;

  }

  get ( symbol: typeof SYMBOL_SUSPENSE ): ISuspense | undefined;
  get ( symbol: symbol ): any;
  get ( symbol: symbol ) {

    return this.context?.[symbol];

  }

  wrap <T> ( fn: WrappedFunction<T>, owner: IContext | IObserver | IRoot | ISuperRoot | ISuspense, observer: IObserver | undefined ): T {

    const ownerPrev = OWNER;
    const observerPrev = OBSERVER;

    setOwner ( owner );
    setObserver ( observer );

    try {

      return fn ();

    } catch ( error: unknown ) {

      this.catch ( castError ( error ), false ); // Bubbling the error up

      return UNAVAILABLE; // Returning a value that is the least likely to cause bugs

    } finally {

      setOwner ( ownerPrev );
      setObserver ( observerPrev );

    }

  }

}

/* EXPORT */

export default Owner;
