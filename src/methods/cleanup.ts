
/* IMPORT */

import {OWNER, SUPER_OWNER} from '~/constants';
import type {CleanupFunction, Callable} from '~/types';

/* MAIN */

const cleanup = ( fn: Callable<CleanupFunction> ): void => {

  if ( OWNER.current === SUPER_OWNER ) return;

  OWNER.current.registerCleanup ( fn );

};

/* EXPORT */

export default cleanup;
