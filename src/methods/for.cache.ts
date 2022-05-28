
/* IMPORT */

import resolve from '~/methods/resolve';
import Root from '~/objects/root';
import type {MapFunction, Resolved} from '~/types';

/* HELPERS */

class MappedRoot<T = unknown> extends Root { // This saves some memory compared to making a dedicated standalone object for metadata
  bool?: boolean;
  result?: T;
}

/* MAIN */

class Cache<T, R> {

  /* VARIABLES */

  fn: MapFunction<T, R>;
  cache: Map<T, MappedRoot<Resolved<R>>> = new Map ();
  bool = false; // The bool is flipped with each iteration, the roots that don't have the updated one are disposed, it's like a cheap counter basically
  prevCount: number = 0; // Number of previous items
  nextCount: number = 0; // Number of next items

  /* CONSTRUCTOR */

  constructor ( fn: MapFunction<T, R> ) {

    this.fn = fn;

  }

  /* API */

  cleanup = (): void => {

    if ( !this.prevCount ) return; // There was nothing before, no need to cleanup

    if ( !this.nextCount ) return this.dispose (); // There is nothing after, quickly disposing

    const {cache, bool} = this;

    cache.forEach ( ( mapped, value ) => {

      if ( mapped.bool === bool ) return;

      mapped.dispose ( true, true );

      cache.delete ( value );

    });

  };

  dispose = (): void => {

    if ( !this.cache.size ) return; // Nothing to dispose of

    this.cache.forEach ( mapped => {

      mapped.dispose ( true, true );

    });

    this.cache = new Map ();

  };

  before = ( values: readonly T[] ): void => {

    this.bool = !this.bool;
    this.nextCount = 0;

  };

  after = ( values: readonly T[] ): void => {

    this.nextCount = values.length;

    this.cleanup ();

    this.prevCount = this.nextCount;

  };

  map = ( value: T ): Resolved<R> => {

    const {cache, bool, fn} = this;

    const cached = cache.get ( value );

    if ( cached ) {

      cached.bool = bool;

      return cached.result!; //TSC

    } else {

      const mapped = new MappedRoot<R> ( true );

      return mapped.wrap ( () => {

        const result = resolve ( fn ( value ) );

        mapped.bool = bool;
        mapped.result = result;

        cache.set ( value, mapped );

        return result;

      });

    }

  };

};

/* EXPORT */

export default Cache;
