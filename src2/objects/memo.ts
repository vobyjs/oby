
/* IMPORT */

import {FLAG_OWNER_TYPE_MEMO, MASK_OWNER_TYPE, FLAG_OWNER_DIRTY_MAYBE_YES, MASK_OWNER_DIRTY, EMPTY_ARRAY, UNINITIALIZED} from '../constants';
import {OWNER} from '../context';
import {observableNew, observableStale} from '../objects/observable';
import type {MemoFunction, OwnerState, MemoOptions} from '../types';

/* MAIN */

const memoNew = <T> ( fn: MemoFunction<T>, options?: MemoOptions<T> ): OwnerState => {

  return {
    flags: FLAG_OWNER_TYPE_MEMO,
    catchers: OWNER.catchers,
    cleanups: EMPTY_ARRAY,
    contexts: OWNER.contexts,
    observables: EMPTY_ARRAY,
    observers: EMPTY_ARRAY,
    observable: observableNew ( UNINITIALIZED, options )
  };

};

const memoIs = ( owner: OwnerState ): boolean => {

  return ( owner.flags & MASK_OWNER_TYPE ) === FLAG_OWNER_TYPE_MEMO;

};

const memoStale = ( owner: OwnerState, status: number ): void => {

  const statusPrev = ( owner.flags & MASK_OWNER_DIRTY );

  if ( statusPrev >= status ) return;

  owner.flags &=~ MASK_OWNER_DIRTY;
  owner.flags |= status;

  if ( statusPrev === FLAG_OWNER_DIRTY_MAYBE_YES ) return;

  observableStale ( owner.observable, status );

};

/* EXPORT */

export {memoNew, memoIs, memoStale};
