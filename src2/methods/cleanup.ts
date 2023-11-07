
/* IMPORT */

import {OWNER} from '../context';
import {ownerCleanup} from '../objects/owner';
import type {CleanupFunction, Callable} from '../types';

/* MAIN */

const cleanup = ( fn: Callable<CleanupFunction> ): void => {

  ownerCleanup ( OWNER, fn );

};

/* EXPORT */

export default cleanup;
