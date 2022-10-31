
/* IMPORT */

import {readable} from '~/objects/callable';
import Memo from '~/objects/memo';
import type {MemoFunction, ObservableReadonly, ObservableOptions} from '~/types';

/* MAIN */

const memo = <T> ( fn: MemoFunction<T>, options?: ObservableOptions<T | undefined> ): ObservableReadonly<T> => {

  const memo = new Memo ( fn, options );
  const observable = readable ( memo.observable );

  return observable;

};

/* EXPORT */

export default memo;
