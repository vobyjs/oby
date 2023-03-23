
/* IMPORT */

import {frozen} from '~/objects/callable';

/* MAIN */

const DIRTY_NO = 0;
const DIRTY_MAYBE = 1;
const DIRTY_YES = 2;

const OBSERVABLE_FALSE = frozen ( false );
const OBSERVABLE_TRUE = frozen ( true );

/* EXPORT */

export {DIRTY_NO, DIRTY_MAYBE, DIRTY_YES};
export {OBSERVABLE_FALSE, OBSERVABLE_TRUE};
