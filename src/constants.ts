
/* IMPORT */

import {frozen} from '~/objects/callable';

/* MAIN */

const DIRTY_NO = 0;
const DIRTY_MAYBE_NO = 1;
const DIRTY_MAYBE_YES = 2;
const DIRTY_YES = 3;

const OBSERVABLE_FALSE = frozen ( false );
const OBSERVABLE_TRUE = frozen ( true );

/* EXPORT */

export {DIRTY_NO, DIRTY_MAYBE_NO, DIRTY_MAYBE_YES, DIRTY_YES};
export {OBSERVABLE_FALSE, OBSERVABLE_TRUE};
