
/* IMPORT */

import {SYMBOL_OBSERVABLE_FROZEN} from '~/constants';
import target from '~/methods/target';
import type {IObservable, ListenerFunction, Observable, ObservableReadonly, Callable} from '~/types';

/* MAIN */

const on = <T> ( observable: Observable<T> | ObservableReadonly<T> | IObservable<T>, listener: Callable<ListenerFunction<T>> ): void => {

  if ( SYMBOL_OBSERVABLE_FROZEN in observable ) {

    listener.call ( listener, ( observable as ObservableReadonly<T> )() ); //TSC

  } else {

    target ( observable ).registerListener ( listener );

  }

};

/* EXPORT */

export default on;
