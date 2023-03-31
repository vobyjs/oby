
/* IMPORT */

import {OWNER, SUSPENSE_ENABLED} from '~/context';
import {lazySetAdd, lazySetDelete} from '~/lazy';
import cleanup from '~/methods/cleanup';
import get from '~/methods/get';
import memo from '~/methods/memo';
import resolve from '~/methods/resolve';
import {frozen, readable} from '~/objects/callable';
import Observable from '~/objects/observable';
import Root from '~/objects/root';
import {SYMBOL_CACHED, SYMBOL_UNCACHED} from '~/symbols';
import type {IObservable, IOwner, MapValueFunction, Indexed, Resolved} from '~/types';

/* HELPERS */

const DUMMY_INDEX = frozen ( -1 );

class MappedRoot<T = unknown, R = unknown> extends Root { // This saves some memory compared to making a dedicated standalone object for metadata
  index?: IObservable<number>;
  value?: IObservable<T>;
  result?: R;
}

/* MAIN */

//TODO: Optimize this more

class CacheUnkeyed<T, R> {

  /* VARIABLES */

  private parent: IOwner = OWNER;
  private fn: MapValueFunction<T, R>;
  private fnWithIndex: boolean;
  private cache: Map<T, MappedRoot<T, Resolved<R>>> = new Map ();

  /* CONSTRUCTOR */

  constructor ( fn: MapValueFunction<T, R> ) {

    this.fn = fn;
    this.fnWithIndex = ( fn.length > 1 );

    if ( SUSPENSE_ENABLED ) {

      lazySetAdd ( this.parent, 'roots', this.roots );

    }

  }

  /* API */

  cleanup = (): void => {

    this.cache.forEach ( mapped => {

      mapped.dispose ();

    });

  };

  dispose = (): void => {

    if ( SUSPENSE_ENABLED ) {

      lazySetDelete ( this.parent, 'roots', this.roots );

    }

    this.cleanup ();

  };

  map = ( values: readonly T[] ): Resolved<R>[] => {

    const {cache, fn, fnWithIndex} = this;
    const cacheNext: Map<T, MappedRoot<T, Resolved<R>>> = new Map ();
    const results: Resolved<R>[] = new Array ( values.length );

    let resultsCached = true; // Whether all results are cached, if so this enables an optimization
    let resultsUncached = true; // Whether all results are anew, if so this enables an optimization in Voby
    let leftovers: number[] = [];

    if ( cache.size ) {

      for ( let i = 0, l = values.length; i < l; i++ ) {

        const value = values[i];
        const cached = cache.get ( value );

        if ( cached ) {

          resultsUncached = false;

          cache.delete ( value );
          cacheNext.set ( value, cached );

          cached.index?.set ( i );

          results[i] = cached.result!; //TSC

        } else {

          leftovers.push ( i );

        }

      }

    } else {

      leftovers = new Array ( results.length );

    }

    outer:
    for ( let i = 0, l = leftovers.length; i < l; i++ ) {

      const index = leftovers[i] || i;
      const value = values[index];
      const isDuplicate = cacheNext.has ( value );

      if ( !isDuplicate ) {

        for ( const [key, mapped] of cache.entries () ) {

          cache.delete ( key );
          cacheNext.set ( value, mapped );

          mapped.index?.set ( index );
          mapped.value?.set ( value );

          results[index] = mapped.result!; //TSC

          continue outer;

        }

      }

      resultsCached = false;

      const mapped = new MappedRoot<T, R> ( false );

      if ( isDuplicate ) {

        cleanup ( () => mapped.dispose () );

      }

      mapped.wrap ( () => {

        let $index = DUMMY_INDEX;

        if ( fnWithIndex ) {

          mapped.index = new Observable ( index );
          $index = readable ( mapped.index );

        }

        const observable = mapped.value = new Observable ( value );
        const $value = memo ( () => get ( observable.get () ) ) as Indexed<T>; //TSC
        const result = results[index] = resolve ( fn ( $value, $index ) );

        mapped.value = observable;
        mapped.result = result;

        if ( !isDuplicate ) {

          cacheNext.set ( value, mapped );

        }

      });

    }

    this.cleanup ();

    this.cache = cacheNext;

    if ( resultsCached ) {

      results[SYMBOL_CACHED] = true;

    }

    if ( resultsUncached ) {

      results[SYMBOL_UNCACHED] = true;

    }

    return results;

  };

  roots = (): MappedRoot<T, R>[] => {

    return Array.from ( this.cache.values () );

  };

}

/* EXPORT */

export default CacheUnkeyed;
