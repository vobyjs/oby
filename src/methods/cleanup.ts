
/* IMPORT */

import {OWNER} from '~/context';
import {PoolOwnerCleanups} from '~/objects/pool';
import type {CleanupFunction, Callable} from '~/types';

/* MAIN */

const cleanup = ( fn: Callable<CleanupFunction> ): void => {

  PoolOwnerCleanups.register ( OWNER, fn );

};

/* EXPORT */

export default cleanup;

//TODO: REVIEW
