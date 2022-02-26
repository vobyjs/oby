
/* IMPORT */

import Batch from './batch';
import callable from './callable';
import Computed from './computed';
import Context from './context';
import disposed from './disposed';
import Effect from './effect';
import from from './from';
import get from './get';
import is from './is';
import Observable from './observable';
import {ObservableCallableWithoutInitial, ObservableCallable, ObservableOptions} from './types';

/* MAIN */

function observable <T> (): ObservableCallableWithoutInitial<T>;
function observable <T> ( value: undefined, options?: ObservableOptions<T, T | undefined> ): ObservableCallableWithoutInitial<T>;
function observable <T> ( value: T, options?: ObservableOptions<T, T> ): ObservableCallable<T>;
function observable <T> ( value?: T, options?: ObservableOptions<T, T | undefined> ) {

  return callable ( new Observable ( value, options ) );

}

/* UTILITIES */

observable.batch = Batch.wrap;
observable.cleanup = Context.registerCleanup;
observable.computed = Computed.wrap;
observable.disposed = disposed;
observable.effect = Effect.wrap;
observable.error = Context.registerError;
observable.from = from;
observable.get = get;
observable.is = is;
observable.root = Context.wrapVoid;
observable.sample = Context.wrapWithSampling;

/* EXPORT */

export default observable;
