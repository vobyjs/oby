
/* IMPORT */

import {FLAG_OWNER_TYPE_ERROR, MASK_OWNER_TYPE, EMPTY_ARRAY} from '../constants';
import {OWNER} from '../context';
import type {ErrorFunction, OwnerState} from '../types';

/* MAIN */

const errorNew = ( catcher: ErrorFunction ): OwnerState => {

  //TODO: make sure "catcher" is not garbage collected while this, and only this, observer is not garbage collected though...

  return {
    flags: FLAG_OWNER_TYPE_ERROR,
    catchers: [new WeakRef ( catcher ), ...OWNER.catchers],
    cleanups: EMPTY_ARRAY,
    contexts: OWNER.contexts,
    observables: EMPTY_ARRAY,
    observers: EMPTY_ARRAY
  };

};

const errorIs = ( owner: OwnerState ): boolean => {

  return ( owner.flags & MASK_OWNER_TYPE ) === FLAG_OWNER_TYPE_ERROR;

};

/* EXPORT */

export {errorNew, errorIs};
