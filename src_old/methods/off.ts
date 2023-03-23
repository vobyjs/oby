
/* IMPORT */

import isObservableFrozen from '~/methods/is_observable_frozen';
import target from '~/methods/target';
import type {IObservable, ListenerFunction, Observable, ObservableReadonly, Callable} from '~/types';

/* MAIN */

const off = <T> ( observable: Observable<T> | ObservableReadonly<T> | IObservable<T>, listener: Callable<ListenerFunction<T>> ): void => {

  if ( !isObservableFrozen ( observable ) ) {

    target ( observable ).unregisterListener ( listener );

  }

};

/* EXPORT */

export default off;
