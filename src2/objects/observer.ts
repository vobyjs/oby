
/* IMPORT */

import {effectIs} from '../objects/effect';
import {memoIs} from '../objects/memo';
import type {OwnerState} from '../types';

/* MAIN */

const observerIs = ( owner: OwnerState ): boolean => {

  return effectIs ( owner ) || memoIs ( owner );

};

/* EXPORT */

export {observerIs};
