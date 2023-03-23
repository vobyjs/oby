
/* IMPORT */

import {OWNER} from '~/context';
import type {CleanupFunction, Callable} from '~/types';

/* MAIN */

const cleanup = ( fn: Callable<CleanupFunction> ): void => {

  OWNER.cleanups.push ( fn );

};

/* EXPORT */

export default cleanup;
