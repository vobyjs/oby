
/* IMPORT */

import {FLAG_OWNER_TYPE_EFFECT, MASK_OWNER_TYPE, MASK_OWNER_DIRTY, EMPTY_ARRAY} from '../constants';
import {OWNER} from '../context';
import type {EffectFunction, OwnerState, EffectOptions} from '../types';

/* MAIN */

const effectNew = ( fn: EffectFunction, options?: EffectOptions ): OwnerState => {

  //TODO: options.sync
  //TODO: schedule
  //TODO: suspense

  return {
    flags: FLAG_OWNER_TYPE_EFFECT,
    catchers: OWNER.catchers,
    cleanups: EMPTY_ARRAY,
    contexts: OWNER.contexts,
    observables: EMPTY_ARRAY,
    observers: EMPTY_ARRAY
  };

};

const effectIs = ( owner: OwnerState ): boolean => {

  return ( owner.flags & MASK_OWNER_TYPE ) === FLAG_OWNER_TYPE_EFFECT;

};

const effectStale = ( owner: OwnerState, status: number ): void => {

  const statusPrev = ( owner.flags & MASK_OWNER_DIRTY );

  if ( statusPrev >= status ) return;

  owner.flags &=~ MASK_OWNER_DIRTY;
  owner.flags |= status;

  //TODO: schedule

};

/* EXPORT */

export {effectNew, effectIs, effectStale};
