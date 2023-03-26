
/* IMPORT */

import {SYMBOL_OBSERVABLE} from '~/symbols';
import {isFunction} from '~/utils';
import type {IObservable, Observable, ObservableReadonly} from '~/types';

/* MAIN */

//TOOD: Maybe this function can be deleted somehow

const target = <T> ( observable: Observable<T> | ObservableReadonly<T> | IObservable<T> ): IObservable<T> => {

  if ( isFunction ( observable ) ) {

    return observable ( SYMBOL_OBSERVABLE as any ) as any; //TSC

  } else {

    return observable;

  }

};

/* EXPORT */

export default target;
