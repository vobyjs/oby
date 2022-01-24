
/* IMPORT */

import {SYMBOL} from './constants';
import Observable from './observable';
import {IObservableWithoutInitial, IObservable} from './types';

/* MAIN */

// The most optimized way to make an Observable class callable
// It has ~50% memory usage overhead over just creating the Observable class, which is the most memory efficient but classes are not callable
// It has ~50% startup time overhead over just creating the bound functions manually, which is the fastest for a low number of methods but always consumes a shitload of memory
// It has some runtime overhead since Proxy is used

const callable = (() => {

  const noop = (): void => {};

  class ObservableTraps <T> {
    observable: Observable<T>;
    constructor ( observable: Observable<T> ) {
      this.observable = observable;
    }
    get ( target: unknown, property: number | string | symbol ) {
      const observable = this.observable;
      if ( property === SYMBOL ) return observable;
      const value = observable[property];
      const isFunction = ( typeof value === 'function' );
      return isFunction ? value.bind ( observable ) : value;
    }
    apply ( target: unknown, thisArg: unknown, args: unknown[] ) {
      const observable = this.observable;
      return observable.call.apply ( observable, args );
    }
  }

  return <T> ( observable: Observable<T> ): IObservableWithoutInitial<T> | IObservable<T> => {

    const traps = new ObservableTraps ( observable );

    return new Proxy ( noop, traps ) as any; //TSC

  };

})();

/* EXPORT */

export default callable;
