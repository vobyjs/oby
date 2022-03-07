
/* IMPORT */

import Batch from './batch';
import Computed from './computed';
import context from './context';
import disposed from './disposed';
import Effect from './effect';
import from from './from';
import get from './get';
import is from './is';
import ObservableClass from './observable';
import Owner from './owner';
import writable from './writable';
import {Observable, ObservableWithoutInitial, ObservableReadonly, ObservableReadonlyWithoutInitial, ObservableAny, ObservableOptions} from './types';

/* MAIN */

function observable <T> (): ObservableWithoutInitial<T>;
function observable <T> ( value: undefined, options?: ObservableOptions<T, T | undefined> ): ObservableWithoutInitial<T>;
function observable <T> ( value: T, options?: ObservableOptions<T, T> ): Observable<T>;
function observable <T> ( value?: T, options?: ObservableOptions<T, T | undefined> ) {

  return writable ( new ObservableClass ( value, options ) );

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
observable.root = Owner.wrap;
observable.sample = Owner.wrapWithSampling;

/* EXPORT */

export default observable;
export type {Observable, ObservableWithoutInitial, ObservableReadonly, ObservableReadonlyWithoutInitial, ObservableAny, ObservableOptions};
