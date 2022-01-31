
/* IMPORT */

import {SYMBOL} from './constants';
import Observable from './observable';
import {ObservableCallableWithoutInitial, ObservableCallable} from './types';

/* MAIN */

// The ~most optimized way to make an Observable class callable
// It has ~50% memory usage overhead over just creating the Observable class, which is the most memory efficient but classes are not callable
// It has ~50% startup time overhead over just creating the bound functions manually, which is the fastest for a low number of methods but always consumes a shitload of memory
// It has some runtime overhead since Proxy is used

const callable = (() => {

  const self = function () {
    return this;
  };

  const traps = {
    get ( target: () => Observable, property: number | string | symbol ) {
      if ( property === SYMBOL ) return true;
      const observable = target ();
      return observable[property].bind ( observable );
    },
    apply ( target: () => Observable, thisArg: unknown, args: unknown[] ) {
      if ( !args.length ) return target ().get ();
      return target ().set ( args[0] );
    }
  };

  return ( observable: Observable ): ObservableCallableWithoutInitial | ObservableCallable => {
    return new Proxy ( self.bind ( observable ), traps );
  };

})();

/* EXPORT */

export default callable;
