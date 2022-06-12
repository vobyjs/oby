
/* IMPORT */

import {SYMBOL_OBSERVABLE_FROZEN} from '~/constants';
import target from '~/methods/target';
import type {IObservable, ListenerFunction, Observable, ObservableReadonly, Callable} from '~/types';

/* MAIN */

const off = <T> ( observable: Observable<T> | ObservableReadonly<T> | IObservable<T>, listener: Callable<ListenerFunction<T>> ): void => {

  if ( SYMBOL_OBSERVABLE_FROZEN in observable ) {

    return;

  } else {

    target ( observable ).unregisterListener ( listener );

  }

};

/* EXPORT */

export default off;
