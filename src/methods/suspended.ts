
/* IMPORT */

import {OWNER, SUSPENSE, SUSPENSE_ENABLED, SYMBOL_SUSPENSE} from '~/constants';
import type {ISuspense} from '~/types';

/* MAIN */

const suspended = (): number | undefined => {

  if ( !SUSPENSE_ENABLED.current ) return;

  const suspense = SUSPENSE.current || OWNER.current.read<ISuspense> ( SYMBOL_SUSPENSE );

  return suspense?.suspended;

};

/* EXPORT */

export default suspended;
