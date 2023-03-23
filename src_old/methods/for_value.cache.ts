
/* IMPORT */

import {OWNER} from '~/context';
import batch from '~/methods/batch';
import cleanup from '~/methods/cleanup';
import CacheAbstract from '~/methods/for_abstract.cache';
import get from '~/methods/get';
import memo from '~/methods/memo';
import resolve from '~/methods/resolve';
import {frozen, readable} from '~/objects/callable';
import Observable from '~/objects/observable';
import Root from '~/objects/root';
import {SYMBOL_CACHED, SYMBOL_UNCACHED} from '~/symbols';
import type {IObservable, IObserver, MapValueFunction, Indexed, Resolved} from '~/types';

/* HELPERS */

const DUMMY_INDEX = frozen ( -1 );

class MappedRoot<T = unknown, R = unknown> extends Root { // This saves some memory compared to making a dedicated standalone object for metadata
  index?: IObservable<number>;
  value?: IObservable<T>;
  result?: R;
}

/* MAIN */

//TODO: Optimize this more

class Cache<T, R> extends CacheAbstract<T, R> {

  /* VARIABLES */

  private fn: MapValueFunction<T, R>;
  private fnWithIndex: boolean;
  private cache: Map<T, MappedRoot<T, Resolved<R>>> = new Map ();
  private parent: IObserver = OWNER;

  /* CONSTRUCTOR */

  constructor ( fn: MapValueFunction<T, R> ) {

    super ( fn );

    this.fn = fn;
    this.fnWithIndex = ( fn.length > 1 );
    this.parent.registerRoot ( this.roots );

  }

  /* API */

  cleanup = (): void => {

    this.cache.forEach ( mapped => {

      mapped.dispose ( true, true );

    });

  };

  dispose = (): void => {

    this.parent.unregisterRoot ( this.roots );

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

          cached.index?.write ( i );

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

          if ( fnWithIndex ) {

            batch ( () => {
              mapped.index?.write ( index );
              mapped.value?.write ( value );
            });

          } else {

            mapped.index?.write ( index );
            mapped.value?.write ( value );

          }

          results[index] = mapped.result!; //TSC

          continue outer;

        }

      }

      resultsCached = false;

      const mapped = new MappedRoot<T, R> ();

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
        const $value = memo ( () => get ( observable.read () ) ) as Indexed<T>; //TSC
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

};

/* EXPORT */

export default Cache;
