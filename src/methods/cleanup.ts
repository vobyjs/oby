
/* IMPORT */

import {OWNER} from '~/constants';
import type {CleanupFunction} from '~/types';

/* MAIN */

const cleanup = ( fn: CleanupFunction ): void => {

  OWNER.current.registerCleanup ( fn );

};

/* EXPORT */

export default cleanup;
