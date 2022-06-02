
/* IMPORT */

import {SYMBOL_OBSERVABLE_FROZEN, SYMBOL_OBSERVABLE_READABLE} from '~/constants';
import computed from '~/methods/computed';
import type {Observable, ObservableReadonly} from '~/types';

/* MAIN */

const readonly = <T> ( observable: Observable<T> | ObservableReadonly<T> ): ObservableReadonly<T> => {

  if ( SYMBOL_OBSERVABLE_FROZEN in observable || SYMBOL_OBSERVABLE_READABLE in observable ) return observable;

  return computed ( observable );

};

/* EXPORT */

export default readonly;
