
/* IMPORT */

import {FLAG_OWNER_TYPE_ROOT, MASK_OWNER_TYPE, EMPTY_ARRAY} from '../constants';
import {OWNER} from '../context';
import type {OwnerState} from '../types';

/* MAIN */

const rootNew = (): OwnerState => {

  return {
    flags: FLAG_OWNER_TYPE_ROOT,
    catchers: OWNER.catchers,
    cleanups: EMPTY_ARRAY,
    contexts: OWNER.contexts,
    observables: EMPTY_ARRAY,
    observers: EMPTY_ARRAY
  };

};

const rootIs = ( owner: OwnerState ): boolean => {

  return ( owner.flags & MASK_OWNER_TYPE ) === FLAG_OWNER_TYPE_ROOT;

};

/* EXPORT */

export {rootNew, rootIs};
