
/* IMPORT */

import {SYMBOL_OBSERVABLE_FROZEN} from '~/constants';
import off from '~/methods/off';
import target from '~/methods/target';
import type {IObservable, DisposeFunction, ListenerFunction, Observable, ObservableReadonly, Callable} from '~/types';

/* MAIN */

const on = <T> ( observable: Observable<T> | ObservableReadonly<T> | IObservable<T>, listener: Callable<ListenerFunction<T>> ): DisposeFunction => {

  if ( SYMBOL_OBSERVABLE_FROZEN in observable ) {

    listener.call ( listener, ( observable as ObservableReadonly<T> )() ); //TSC

  } else {

    target ( observable ).registerListener ( listener );

  }

  return (): void => {

    off ( observable, listener );

  };

};

/* EXPORT */

export default on;
