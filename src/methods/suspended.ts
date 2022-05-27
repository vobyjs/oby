
/* IMPORT */

import {OWNER, SUSPENSE, SUSPENSE_ENABLED, SYMBOL_SUSPENSE} from '~/constants';
import type {ISuspense} from '~/types';

/* MAIN */

const suspended = (): number => {

  if ( !SUSPENSE_ENABLED.current ) return 0;

  const suspense = SUSPENSE.current || OWNER.current.context<ISuspense> ( SYMBOL_SUSPENSE );

  return suspense?.suspended || 0;

};

/* EXPORT */

export default suspended;
