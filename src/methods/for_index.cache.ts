
/* IMPORT */

import {OWNER} from '~/constants';
import computed from '~/methods/computed';
import get from '~/methods/get';
import resolve from '~/methods/resolve';
import Observable from '~/objects/observable';
import Root from '~/objects/root';
import type {IObservable, IObserver, MapFunction, Indexed, Resolved} from '~/types';

/* HELPERS */

class IndexedRoot<T = unknown, R = unknown> extends Root { // This saves some memory compared to making a dedicated standalone object for metadata
  source?: IObservable<T>;
  target?: Indexed<T>;
  result?: R;
}

/* MAIN */

class Cache<T, R> {

  /* VARIABLES */

  fn: MapFunction<Indexed<T>, R>;
  cache: IndexedRoot<T, Resolved<R>>[];
  parent: IObserver = OWNER.current;

  /* CONSTRUCTOR */

  constructor ( fn: MapFunction<Indexed<T>, R> ) {

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
    const results: Resolved<R>[] = [];

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
          const target = computed ( () => get ( source.read () ) ) as Indexed<T>; //TSC

          indexed.source = source;
          indexed.target = target;
          indexed.result = resolve ( fn ( target ) );

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
