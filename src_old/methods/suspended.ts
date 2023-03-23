
/* IMPORT */

import {OWNER, SUSPENSE, SUSPENSE_ENABLED} from '~/context';
import {SYMBOL_SUSPENSE} from '~/symbols';
import type {ISuspense} from '~/types';

/* MAIN */

const suspended = (): number | undefined => {

  if ( !SUSPENSE_ENABLED ) return;

  const suspense = SUSPENSE || OWNER.read<ISuspense> ( SYMBOL_SUSPENSE );

  return suspense?.suspended;

};

/* EXPORT */

export default suspended;
