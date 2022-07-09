
/* IMPORT */

import {OWNER} from '~/constants';
import cleanup from '~/methods/cleanup';
import CacheAbstract from '~/methods/for_abstract.cache';
import resolve from '~/methods/resolve';
import {frozen, readable} from '~/objects/callable';
import Observable from '~/objects/observable';
import Root from '~/objects/root';
import type {IObservable, IObserver, MapFunction, Resolved} from '~/types';

/* HELPERS */

const DUMMY_INDEX = frozen ( -1 );

class MappedRoot<T = unknown> extends Root { // This saves some memory compared to making a dedicated standalone object for metadata
  bool?: boolean;
  observable?: IObservable<number>;
  result?: T;
}

/* MAIN */

class Cache<T, R> extends CacheAbstract<T, R> {

  /* VARIABLES */

  private fn: MapFunction<T, R>;
  private fnWithIndex: boolean;
  private cache: Map<T, MappedRoot<Resolved<R>>> = new Map ();
  private bool = false; // The bool is flipped with each iteration, the roots that don't have the updated one are disposed, it's like a cheap counter basically
  private prevCount: number = 0; // Number of previous items
  private nextCount: number = 0; // Number of next items
  private parent: IObserver = OWNER.current;

  /* CONSTRUCTOR */

  constructor ( fn: MapFunction<T, R> ) {

    super ( fn );

    this.fn = fn;
    this.fnWithIndex = ( fn.length > 1 );
    this.parent.registerRoot ( this.roots );

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

    this.parent.unregisterRoot ( this.roots );

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

  map = ( values: readonly T[] ): Resolved<R>[] => {

    this.before ( values );

    const {cache, bool, fn, fnWithIndex} = this;
    const results: Resolved<R>[] = new Array ( values.length );

    for ( let i = 0, l = values.length; i < l; i++ ) {

      const value = values[i];
      const cached = cache.get ( value );

      if ( cached && cached.bool !== bool ) {

        cached.bool = bool;
        cached.observable?.write ( i );

        results[i] = cached.result!; //TSC

      } else {

        const mapped = new MappedRoot<R> ();

        if ( cached ) {

          cleanup ( () => mapped.dispose () );

        }

        mapped.wrap ( () => {

          let observable = DUMMY_INDEX;

          if ( fnWithIndex ) {

            mapped.observable = new Observable ( i );
            observable = readable ( mapped.observable );

          }

          const result = results[i] = resolve ( fn ( value, observable ) );

          mapped.bool = bool;
          mapped.result = result;

          if ( !cached ) {

            cache.set ( value, mapped );

          }

        });

      }

    }

    this.after ( values );

    return results;

  };

  roots = (): MappedRoot<R>[] => {

    return Array.from ( this.cache.values () );

  };

};

/* EXPORT */

export default Cache;
