
/* IMPORT */

import batch from '~/methods/batch';
import cleanup from '~/methods/cleanup';
import computed from '~/methods/computed';
import context from '~/methods/context';
import disposed from '~/methods/disposed';
import effect from '~/methods/effect';
import error from '~/methods/error';
import from from '~/methods/from';
import get from '~/methods/get';
import _if from '~/methods/if';
import is from '~/methods/is';
import map from '~/methods/map';
import resolve from '~/methods/resolve';
import root from '~/methods/root';
import sample from '~/methods/sample';
import selector from '~/methods/selector';
import ObservableClass from '~/objects/observable';
import type {ObservableWithoutInitial, ObservableOptions, Observable, ObservableReadonly, ObservableReadonlyWithoutInitial, ObservableAny} from '~/types';

/* MAIN */

function observable <T> (): ObservableWithoutInitial<T>;
function observable <T> ( value: undefined, options?: ObservableOptions<T, T | undefined> ): ObservableWithoutInitial<T>;
function observable <T> ( value: T, options?: ObservableOptions<T, T> ): Observable<T>;
function observable <T> ( value?: T, options?: ObservableOptions<T, T | undefined> ) {

  return new ObservableClass ( value, options ).writable ();

}

/* UTILITIES */

observable.batch = batch;
observable.cleanup = cleanup;
observable.computed = computed;
observable.context  = context;
observable.disposed = disposed;
observable.effect = effect;
observable.error = error;
observable.from = from;
observable.get = get;
observable.if = _if;
observable.is = is;
observable.map = map;
observable.resolve = resolve;
observable.root = root;
observable.sample = sample;
observable.selector = selector;

/* EXPORT */

export default observable;
export type {Observable, ObservableWithoutInitial, ObservableReadonly, ObservableReadonlyWithoutInitial, ObservableAny, ObservableOptions};
