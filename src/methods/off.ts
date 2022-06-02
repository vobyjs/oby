
/* IMPORT */

import {SYMBOL_OBSERVABLE_FROZEN} from '~/constants';
import target from '~/methods/target';
import type {ListenerFunction, Observable, ObservableReadonly} from '~/types';

/* MAIN */

const off = <T> ( observable: Observable<T> | ObservableReadonly<T>, listener: ListenerFunction<T> ): void => {

  if ( SYMBOL_OBSERVABLE_FROZEN in observable ) return;

  target ( observable ).unregisterListener ( listener );

};

/* EXPORT */

export default off;
