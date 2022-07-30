
/* IMPORT */

import {frozen, readable} from '~/objects/callable';
import Memo from '~/objects/memo';
import Observable from '~/objects/observable';
import type {MemoFunction, ObservableReadonly, ObservableOptions} from '~/types';

/* HELPERS */

const DUMMY_FN = (): any => {};
const DUMMY_OBSERVABLE = new Observable<any> ( undefined );

/* MAIN */

const memo = <T> ( fn: MemoFunction<T>, options?: ObservableOptions<T | undefined> ): ObservableReadonly<T> => {

  const memo = new Memo ( fn, options );
  const {observable} = memo;

  if ( !memo.observables ) { // It can never run again, freeing up some memory and returning a cheaper frozen observable

    memo.fn = DUMMY_FN;
    memo.observable = DUMMY_OBSERVABLE;

    return frozen ( observable.value );

  } else { // It could run again, returning a regular readable observable

    return readable ( observable );

  }

};

/* EXPORT */

export default memo;
