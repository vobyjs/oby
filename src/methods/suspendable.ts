
/* IMPORT */

import {OWNER, SUSPENSE, SUSPENSE_ENABLED, SYMBOL_SUSPENSE} from '~/constants';
import type {ISuspense} from '~/types';

/* MAIN */

const suspendable = (): boolean => {

  return !!SUSPENSE_ENABLED.current && ( !!SUSPENSE.current || !!OWNER.current.read<ISuspense> ( SYMBOL_SUSPENSE ) );

};

/* EXPORT */

export default suspendable;
