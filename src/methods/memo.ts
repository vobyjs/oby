
/* IMPORT */

import {readable} from '~/objects/callable';
import Memo from '~/objects/memo';
// import PoolMemo from '~/objects/pool.values';
import type {MemoFunction, ObservableReadonly, ObservableOptions} from '~/types';

/* MAIN */

//TODO: Maybe add a way to make frozen observables instead, somehow

const memo = <T> ( fn: MemoFunction<T>, options?: ObservableOptions<T | undefined> ): ObservableReadonly<T> => {

  const memo = new Memo ( fn, options );
  // const memo = PoolMemo.alloc ( fn, options );
  const observable = readable ( memo.observable );

  return observable;

};

/* EXPORT */

export default memo;

//TODO: REVIEW
