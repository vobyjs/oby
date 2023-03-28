
/* IMPORT */

import {UNAVAILABLE} from '~/constants';
import {SYMBOL_OBSERVABLE_READABLE, SYMBOL_OBSERVABLE_WRITABLE} from '~/symbols';
import {isFunction} from '~/utils';
import type {IObservable, Observable, ObservableReadonly} from '~/types';

/* MAIN */

const target = <T> ( observable: Observable<T> | ObservableReadonly<T> | IObservable<T> ): IObservable<T> => {

  if ( isFunction ( observable ) ) {

    return observable[SYMBOL_OBSERVABLE_READABLE] || observable[SYMBOL_OBSERVABLE_WRITABLE] || UNAVAILABLE;

  } else {

    return observable;

  }

};

/* EXPORT */

export default target;
