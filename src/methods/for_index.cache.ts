
/* IMPORT */

import {OWNER} from '~/context';
import CacheAbstract from '~/methods/for_abstract.cache';
import get from '~/methods/get';
import memo from '~/methods/memo';
import resolve from '~/methods/resolve';
import Observable from '~/objects/observable';
import Root from '~/objects/root';
import type {IObservable, IObserver, MapIndexFunction, Indexed, Resolved} from '~/types';

/* HELPERS */

class IndexedRoot<T = unknown, R = unknown> extends Root { // This saves some memory compared to making a dedicated standalone object for metadata
  source?: IObservable<T>;
  target?: Indexed<T>;
  result?: R;
}

/* MAIN */

class Cache<T, R> extends CacheAbstract<T, R> {

  /* VARIABLES */

  private fn: MapIndexFunction<T, R>;
  private cache: IndexedRoot<T, Resolved<R>>[];
  private parent: IObserver = OWNER;

  /* CONSTRUCTOR */

  constructor ( fn: MapIndexFunction<T, R> ) {

    super ( fn );

    this.fn = fn;
    this.cache = [];
    this.parent.registerRoot ( this.roots );

  }

  /* API */

  cleanup = ( startIndex: number ): void => {

    const {cache} = this;

    for ( let i = startIndex, l = cache.length; i < l; i++ ) {

      cache[i].dispose ( true, true );

    }

    cache.length = startIndex;

  };

  dispose = (): void => {

    this.parent.unregisterRoot ( this.roots );

    this.cleanup ( 0 );

  };

  map = ( values: readonly T[] ): Resolved<R>[] => {

    const {cache, fn} = this;
    const results: Resolved<R>[] = new Array ( values.length );

    for ( let i = 0, l = values.length; i < l; i++ ) {

      const value = values[i];
      const cached = cache[i];

      if ( cached ) {

        cached.source!.write ( value ); //TSC

        results[i] = cached.result!; //TSC

      } else {

        const indexed = new IndexedRoot<T, Resolved<R>> ();

        indexed.wrap ( () => {

          const source = new Observable ( value );
          const target = memo ( () => get ( source.read () ) ) as Indexed<T>; //TSC

          indexed.source = source;
          indexed.target = target;
          indexed.result = resolve ( fn ( target, i ) );

          cache[i] = indexed;
          results[i] = indexed.result;

        });

      }

    }

    this.cleanup ( values.length );

    return results;

  };

  roots = (): IndexedRoot<T, R>[] => {

    return Array.from ( this.cache.values () );

  };

};

/* EXPORT */

export default Cache;
