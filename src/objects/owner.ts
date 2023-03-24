
/* IMPORT */

import {OBSERVER, OWNER, setObserver, setOwner} from '~/context';
import type {IObserver, IOwner, IRoot, CleanupFunction, ObservedFunction, Callable, Contexts} from '~/types';

/* MAIN */

//TODO: signal prop
//TODO: errors prop
//TODO: roots prop

class Owner {

  /* VARIABLES */

  parent?: IOwner;
  cleanups: Callable<CleanupFunction>[];
  contexts: Contexts;
  observers: IObserver[];
  roots: IRoot[];

  /* CONSTRUCTOR */

  constructor () {

    this.cleanups = [];
    this.contexts = {};
    this.observers = [];
    this.roots = [];

  }

  /* API */

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

    } finally {

      setOwner ( ownerPrev );
      setObserver ( observerPrev );

    }

  }

}

/* EXPORT */

export default Owner;
