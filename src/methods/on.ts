
/* IMPORT */

import isObservableFrozen from '~/methods/is_observable_frozen';
import off from '~/methods/off';
import target from '~/methods/target';
import type {IObservable, DisposeFunction, ListenerFunction, Observable, ObservableReadonly, Callable} from '~/types';

/* MAIN */

const on = <T> ( observable: Observable<T> | ObservableReadonly<T> | IObservable<T>, listener: Callable<ListenerFunction<T>> ): DisposeFunction => {

  if ( isObservableFrozen ( observable ) ) {

    listener.call ( listener, observable () );

  } else {

    target ( observable ).registerListener ( listener );

  }

  return (): void => {

    off ( observable, listener );

  };

};

/* EXPORT */

export default on;
