
/* IMPORT */

import batch from '~/methods/batch';
import cleanup from '~/methods/cleanup';
import computed from '~/methods/computed';
import context from '~/methods/context';
import disposed from '~/methods/disposed';
import effect from '~/methods/effect';
import error from '~/methods/error';
import errorBoundary from '~/methods/error_boundary';
import from from '~/methods/from';
import get from '~/methods/get';
import _if from '~/methods/if';
import is from '~/methods/is';
import map from '~/methods/map';
import produce from '~/methods/produce';
import resolve from '~/methods/resolve';
import root from '~/methods/root';
import sample from '~/methods/sample';
import selector from '~/methods/selector';
import _switch from '~/methods/switch';
import ternary from '~/methods/ternary';
import ObservableClass from '~/objects/observable';
import type {ObservableWithoutInitial, ObservableOptions, Observable, ObservableReadonly, ObservableReadonlyWithoutInitial, ObservableAny} from '~/types';

/* MAIN */

function $ <T> (): ObservableWithoutInitial<T>;
function $ <T> ( value: undefined, options?: ObservableOptions<T, T | undefined> ): ObservableWithoutInitial<T>;
function $ <T> ( value: T, options?: ObservableOptions<T, T> ): Observable<T>;
function $ <T> ( value?: T, options?: ObservableOptions<T, T | undefined> ) {

  return new ObservableClass ( value, options ).writable ();

}

/* UTILITIES */

$.batch = batch;
$.cleanup = cleanup;
$.computed = computed;
$.context  = context;
$.disposed = disposed;
$.effect = effect;
$.error = error;
$.errorBoundary = errorBoundary;
$.from = from;
$.get = get;
$.if = _if;
$.is = is;
$.map = map;
$.produce = produce;
$.resolve = resolve;
$.root = root;
$.sample = sample;
$.selector = selector;
$.switch = _switch;
$.ternary = ternary;

/* EXPORT */

export default $;
export type {Observable, ObservableWithoutInitial, ObservableReadonly, ObservableReadonlyWithoutInitial, ObservableAny, ObservableOptions};
