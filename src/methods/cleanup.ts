
/* IMPORT */

import {OWNER} from '~/constants';
import type {CleanupFunction} from '~/types';

/* MAIN */

const cleanup = ( cleanup: CleanupFunction ): void => {

  OWNER.current.registerCleanup ( cleanup );

};

/* EXPORT */

export default cleanup;
