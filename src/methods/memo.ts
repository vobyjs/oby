
/* IMPORT */

import isObservableFrozen from '~/methods/is_observable_frozen';
import isUntracked from '~/methods/is_untracked';
import {frozen, readable} from '~/objects/callable';
import Memo from '~/objects/memo';
import type {MemoFunction, MemoOptions, ObservableReadonly} from '~/types';

/* MAIN */

const memo = <T> ( fn: MemoFunction<T>, options?: MemoOptions<T | undefined> ): ObservableReadonly<T> => {

  if ( isObservableFrozen ( fn ) ) {

    return fn;

  } else if ( isUntracked ( fn ) ) {

    return frozen ( fn () );

  } else {

    const memo = new Memo ( fn, options );
    const observable = readable ( memo.observable );

    return observable;

  }

};

/* EXPORT */

export default memo;
