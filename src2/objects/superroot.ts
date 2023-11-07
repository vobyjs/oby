
/* IMPORT */

import {FLAG_OWNER_TYPE_SUPER_ROOT, MASK_OWNER_TYPE, EMPTY_ARRAY, EMPTY_OBJECT} from '../constants';
import type {OwnerState} from '../types';

/* MAIN */

const superRootNew = (): OwnerState => {

  return {
    flags: FLAG_OWNER_TYPE_SUPER_ROOT,
    catchers: EMPTY_ARRAY,
    cleanups: EMPTY_ARRAY,
    contexts: EMPTY_OBJECT,
    observables: EMPTY_ARRAY,
    observers: EMPTY_ARRAY
  };

};

const superRootIs = ( owner: OwnerState ): boolean => {

  return ( owner.flags & MASK_OWNER_TYPE ) === FLAG_OWNER_TYPE_SUPER_ROOT;

};

/* EXPORT */

export {superRootNew, superRootIs};
