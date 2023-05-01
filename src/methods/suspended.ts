
/* IMPORT */

import {OBSERVABLE_FALSE} from '~/constants';
import {OWNER, SUSPENSE_ENABLED} from '~/context';
import {readable} from '~/objects/callable';
import Observable from '~/objects/observable';
import {SYMBOL_SUSPENSE} from '~/symbols';
import type {ISuspense, ObservableReadonly} from '~/types';

/* MAIN */

const suspended = (): ObservableReadonly<boolean> => {

  if ( !SUSPENSE_ENABLED ) return OBSERVABLE_FALSE;

  const suspense = OWNER.get<ISuspense> ( SYMBOL_SUSPENSE );

  if ( !suspense ) return OBSERVABLE_FALSE;

  const observable = ( suspense.observable ||= new Observable ( !!suspense.suspended ) );

  return readable ( observable );

};

/* EXPORT */

export default suspended;
