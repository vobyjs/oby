
/* IMPORT */

import {SYMBOL_OBSERVABLE, SYMBOL_OBSERVABLE_FROZEN} from '~/constants';
import type {IObservable, Observable, ObservableReadonly} from '~/types';

/* MAIN */

const target = <T> ( observable: Observable<T> | ObservableReadonly<T> ): IObservable<T> => {

  if ( SYMBOL_OBSERVABLE_FROZEN in observable ) throw new Error ();

  return observable ( SYMBOL_OBSERVABLE as any ) as any; //TSC

};

/* EXPORT */

export default target;
