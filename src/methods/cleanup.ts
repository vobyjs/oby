
/* IMPORT */

import {OWNER} from '~/context';
import {lazyArrayPush} from '~/lazy';
import type {CleanupFunction, Callable} from '~/types';

/* MAIN */

const cleanup = ( fn: Callable<CleanupFunction> ): void => {

  lazyArrayPush ( OWNER, 'cleanups', fn );

};

/* EXPORT */

export default cleanup;
