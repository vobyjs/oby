
/* IMPORT */

import {OWNER} from '~/context';
import {lazySetAdd, lazySetDelete} from '~/lazy';
import cleanup from '~/methods/cleanup';
import get from '~/methods/get';
import memo from '~/methods/memo';
import resolve from '~/methods/resolve';
import suspense from '~/methods/suspense';
import {frozen, readable} from '~/objects/callable';
import Observable from '~/objects/observable';
import Root from '~/objects/root';
import {SYMBOL_CACHED, SYMBOL_SUSPENSE, SYMBOL_UNCACHED} from '~/symbols';
import type {IObservable, IOwner, ISuspense, MapValueFunction, Indexed, Resolved} from '~/types';

/* HELPERS */

const DUMMY_INDEX = frozen ( -1 );

class MappedRoot<T = unknown, R = unknown> extends Root { // This saves some memory compared to making a dedicated standalone object for metadata
  index?: IObservable<number>;
  value?: IObservable<T>;
  suspended?: IObservable<boolean>;
  result?: R;
}

/* MAIN */

//TODO: Optimize this more

class CacheUnkeyed<T, R> {

  /* VARIABLES */

  private parent: IOwner = OWNER;
  private suspense: ISuspense | undefined = OWNER.get ( SYMBOL_SUSPENSE );
  private fn: MapValueFunction<T, R>;
  private fnWithIndex: boolean;
  private cache: Map<T, MappedRoot<T, Resolved<R>>> = new Map ();
  private pool: MappedRoot<T, Resolved<R>>[] = [];
  private poolMaxSize: number = 0;
  private pooled: boolean;

  /* CONSTRUCTOR */

  constructor ( fn: MapValueFunction<T, R>, pooled: boolean ) {

    this.fn = fn;
    this.fnWithIndex = ( fn.length > 1 );
    this.pooled = pooled;

    if ( this.suspense ) {

      lazySetAdd ( this.parent, 'roots', this.roots );

    }

  }

  /* API */

  cleanup = (): void => {

    let pooled = 0;
    let poolable = Math.max ( 0, this.pooled ? this.poolMaxSize - this.pool.length : 0 );

    this.cache.forEach ( mapped => {

      if ( poolable > 0 && pooled++ < poolable ) {

        mapped.suspended?.set ( true );

        this.pool.push ( mapped );

      } else {

        mapped.dispose ( true );

      }

    });

  };

  dispose = (): void => {

    if ( this.suspense ) {

      lazySetDelete ( this.parent, 'roots', this.roots );

    }

    this.cache.forEach ( mapped => {

      mapped.dispose ( true );

    });

    this.pool.forEach ( mapped => {

      mapped.dispose ( true );

    });

  };

  map = ( values: readonly T[] ): Resolved<R>[] => {

    const {cache, fn, fnWithIndex} = this;
    const cacheNext: Map<T, MappedRoot<T, Resolved<R>>> = new Map ();
    const results: Resolved<R>[] = new Array ( values.length );
    const pool = this.pool;
    const pooled = this.pooled;

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

      let mapped: MappedRoot<T, R>;

      if ( pooled && pool.length ) {

        mapped = pool.pop ()!; //TSC

        mapped.index?.set ( index );
        mapped.value?.set ( value );
        mapped.suspended?.set ( false );

        results[index] = mapped.result!; //TSC

      } else {

        mapped = new MappedRoot<T, R> ( false );

        mapped.wrap ( () => {

          let $index = DUMMY_INDEX;

          if ( fnWithIndex ) {

            mapped.index = new Observable ( index );
            $index = readable ( mapped.index );

          }

          const observable = mapped.value = new Observable ( value );
          const suspended = pooled ? new Observable ( false ) : undefined;
          const $value = memo ( () => get ( observable.get () ) ) as Indexed<T>; //TSC
          const result = results[index] = suspended ? suspense ( () => suspended.get (), () => resolve ( fn ( $value, $index ) ) ) : resolve ( fn ( $value, $index ) );

          mapped.value = observable;
          mapped.result = result;
          mapped.suspended = suspended;

        });

      }

      if ( isDuplicate ) { // Expensive, not reusable

        cleanup ( () => mapped.dispose ( true ) );

      } else { // Cheap, reusable

        cacheNext.set ( value, mapped );

      }

    }

    this.poolMaxSize = Math.max ( this.poolMaxSize, results.length );

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

    return [...this.cache.values (), ...this.pool.values ()];

  };

}

/* EXPORT */

export default CacheUnkeyed;
