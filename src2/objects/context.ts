
/* IMPORT */

import {OWNER} from '../context';
import {FLAG_OWNER_TYPE_CONTEXT, MASK_OWNER_TYPE, EMPTY_ARRAY} from '../constants';
import type {Contexts, OwnerState} from '../types';

/* MAIN */

const contextNew = ( contexts: Contexts ): OwnerState => {

  return {
    flags: FLAG_OWNER_TYPE_CONTEXT,
    catchers: OWNER.catchers,
    cleanups: EMPTY_ARRAY,
    contexts: { ...OWNER.contexts, ...contexts },
    observables: EMPTY_ARRAY,
    observers: EMPTY_ARRAY
  };

};

const contextGet = <T> ( owner: OwnerState, symbol: symbol ): T | undefined => {

  return owner.contexts[symbol];

};

const contextIs = ( owner: OwnerState ): boolean => {

  return ( owner.flags & MASK_OWNER_TYPE ) === FLAG_OWNER_TYPE_CONTEXT;

};

/* EXPORT */

export {contextNew, contextGet, contextIs};
