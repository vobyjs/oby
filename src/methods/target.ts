
/* IMPORT */

import {SYMBOL_OBSERVABLE, SYMBOL_OBSERVABLE_FROZEN} from '~/constants';
import ObservableClass from '~/objects/observable';
import type {IObservable, Observable, ObservableReadonly} from '~/types';

/* MAIN */

const target = <T> ( observable: Observable<T> | ObservableReadonly<T> | IObservable<T> ): IObservable<T> => {

  if ( observable instanceof ObservableClass ) return observable;

  if ( SYMBOL_OBSERVABLE_FROZEN in observable ) throw new Error ( 'Impossible' );

  return observable ( SYMBOL_OBSERVABLE as any ) as any; //TSC

};

/* EXPORT */

export default target;
