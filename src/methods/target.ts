
/* IMPORT */

import {SYMBOL_OBSERVABLE} from '~/constants';
import isObservable from '~/methods/is_observable';
import type {IObservable, Observable, ObservableReadonly} from '~/types';

/* MAIN */

const target = <T> ( observable: Observable<T> | ObservableReadonly<T> | IObservable<T> ): IObservable<T> => {

  if ( isObservable ( observable ) ) {

    return observable ( SYMBOL_OBSERVABLE as any ) as any; //TSC

  } else {

    return observable;

  }

};

/* EXPORT */

export default target;
