
/* IMPORT */

import {OWNER} from '~/constants';
import resolve from '~/methods/resolve';
import root from '~/methods/root';
import type {MapFunction, Mapped, Resolved} from '~/types';

/* MAIN */

class Cache<T, R> {

  /* VARIABLES */

  fn: MapFunction<T, R>;
  cache: Map<T, Mapped<T, Resolved<R>>> = new Map ();
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

    cache.forEach ( mapped => {

      if ( mapped.bool === bool ) return;

      mapped.root.dispose ();

      cache.delete ( mapped.value );

    });

  };

  dispose = (): void => {

    this.cache.forEach ( mapped => {

      mapped.root.dispose ();

    });

    this.cache.clear ();

  };

  before = ( values: T[] ): void => {

    this.bool = !this.bool;
    this.nextCount = 0;

  };

  after = ( values: T[] ): void => {

    this.nextCount = values.length;

    this.cleanup ();

    this.prevCount = this.nextCount;

  };

  map = ( value: T ): Resolved<R> => {

    const {cache, bool} = this;

    const cached = cache.get ( value );

    if ( cached ) {

      cached.bool = bool;

      return cached.result;

    } else {

      return root ( () => {

        const root = OWNER.current;
        const result = resolve ( this.fn ( value ) );
        const mapped = { bool, value, result, root };

        cache.set ( value, mapped );

        return result;

      });

    }

  };

};

/* EXPORT */

export default Cache;
