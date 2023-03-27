
/* IMPORT */

import Memo from '~/objects/memo';
import {PoolValue} from '~/objects/pool';
import type {IMemo, IObservable, IObserver, IOwner, IRoot, ISuspense, CleanupFunction, ErrorFunction, WrappedFunction, Callable, Contexts} from '~/types';
import type {MemoFunction, ObservableOptions} from '~/types';

/* MAIN */

const PoolMemo = new (class Foo<T> extends PoolValue<IMemo<T>, [MemoFunction<T>, ObservableOptions<T> | undefined]> {

  /* VALUE API */

  create (): IMemo<T> {

    return new Memo ();

  }

  hydrate ( value: IMemo<T>, fn: MemoFunction<T>, options?: ObservableOptions<T> ): IMemo<T> {

    return value.hydrate ( fn, options );

  }

  dehydrate ( value: IMemo<T> ): IMemo<T> {

    return value.dehydrate ();

  }

});

/* EXPORT */

export default PoolMemo;
