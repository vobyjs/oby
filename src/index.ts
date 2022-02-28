
/* IMPORT */

import Batch from './batch';
import callable from './callable';
import Computed from './computed';
import context from './context';
import disposed from './disposed';
import Effect from './effect';
import from from './from';
import get from './get';
import is from './is';
import Observable from './observable';
import Owner from './owner';
import {ObservableCallable, ObservableCallableWithoutInitial, ReadonlyObservableCallable, ReadonlyObservableCallableWithoutInitial, ObservableAny, ObservableOptions} from './types';

/* MAIN */

function observable <T> (): ObservableCallableWithoutInitial<T>;
function observable <T> ( value: undefined, options?: ObservableOptions<T, T | undefined> ): ObservableCallableWithoutInitial<T>;
function observable <T> ( value: T, options?: ObservableOptions<T, T> ): ObservableCallable<T>;
function observable <T> ( value?: T, options?: ObservableOptions<T, T | undefined> ) {

  return callable ( new Observable ( value, options ) );

}

/* UTILITIES */

observable.batch = Batch.wrap;
observable.cleanup = Owner.registerCleanup;
observable.computed = Computed.wrap;
observable.context  = context;
observable.disposed = disposed;
observable.effect = Effect.wrap;
observable.error = Owner.registerError;
observable.from = from;
observable.get = get;
observable.is = is;
observable.root = Owner.wrapVoid;
observable.sample = Owner.wrapWithSampling;

/* EXPORT */

export default observable;
export type {ObservableCallable as Observable, ObservableCallableWithoutInitial as ObservableWithoutInitial, ReadonlyObservableCallable as ObservableReadonly, ReadonlyObservableCallableWithoutInitial as ObservableReadonlyWithoutInitial, ObservableAny, ObservableOptions};
