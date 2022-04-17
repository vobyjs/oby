
/* IMPORT */

import batch from './batch';
import {writable} from './callable';
import Computed from './computed';
import context from './context';
import disposed from './disposed';
import Effect from './effect';
import from from './from';
import get from './get';
import is from './is';
import ObservableObject from './observable';
import Owner from './owner';
import Root from './root';
import selector from './selector';
import type {Observable, ObservableWithoutInitial, ObservableReadonly, ObservableReadonlyWithoutInitial, ObservableAny, ObservableOptions} from './types';

/* MAIN */

function observable <T> (): ObservableWithoutInitial<T>;
function observable <T> ( value: undefined, options?: ObservableOptions<T, T | undefined> ): ObservableWithoutInitial<T>;
function observable <T> ( value: T, options?: ObservableOptions<T, T> ): Observable<T>;
function observable <T> ( value?: T, options?: ObservableOptions<T, T | undefined> ) {

  return writable ( ObservableObject.create ( value, options ) );

}

/* UTILITIES */

observable.batch = batch;
observable.cleanup = Owner.registerCleanup;
observable.computed = Computed.wrap;
observable.context  = context;
observable.disposed = disposed;
observable.effect = Effect.wrap;
observable.error = Owner.registerError;
observable.from = from;
observable.get = get;
observable.is = is;
observable.root = Root.wrap;
observable.sample = Owner.wrapWithSampling;
observable.selector = selector;

/* EXPORT */

export default observable;
export type {Observable, ObservableWithoutInitial, ObservableReadonly, ObservableReadonlyWithoutInitial, ObservableAny, ObservableOptions};
