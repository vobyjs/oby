
/* IMPORT */

import {FLAG_OBSERVABLE_TYPE_READABLE} from '../constants';
import isObservableWritable from '../methods/is_observable_writable';
import {SYMBOL_OBSERVABLE} from '../symbols';
import type {Observable, ObservableReadonly} from '../types';

/* MAIN */

//TODO: Maybe somehow unwrap the observable

const readonly = <T> ( observable: Observable<T> | ObservableReadonly<T> ): ObservableReadonly<T> => {

  if ( isObservableWritable ( observable ) ) {

    //TODO: Preserve boolean flag

    const clone = observable.bind ( null );

    clone[SYMBOL_OBSERVABLE] = FLAG_OBSERVABLE_TYPE_READABLE;

    return clone;

  } else {

    return observable;

  }

};

/* EXPORT */

export default readonly;
