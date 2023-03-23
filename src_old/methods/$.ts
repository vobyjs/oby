
/* IMPORT */

import batch from '~/methods/batch';
import boolean from '~/methods/boolean';
import cleanup from '~/methods/cleanup';
import context from '~/methods/context';
import disposed from '~/methods/disposed';
import effect from '~/methods/effect';
import error from '~/methods/error';
import _for from '~/methods/for';
import forIndex from '~/methods/for_index';
import forValue from '~/methods/for_value';
import get from '~/methods/get';
import _if from '~/methods/if';
import isBatching from '~/methods/is_batching';
import isObservable from '~/methods/is_observable';
import isStore from '~/methods/is_store';
import memo from '~/methods/memo';
import off from '~/methods/off';
import on from '~/methods/on';
import owner from '~/methods/owner';
import reaction from '~/methods/reaction';
import readonly from '~/methods/readonly';
import resolve from '~/methods/resolve';
import root from '~/methods/root';
import selector from '~/methods/selector';
import store from '~/methods/store';
import suspense from '~/methods/suspense';
import _switch from '~/methods/switch';
import ternary from '~/methods/ternary';
import tryCatch from '~/methods/try_catch';
import untrack from '~/methods/untrack';
import _with from '~/methods/with';
import {writable} from '~/objects/callable';
import ObservableClass from '~/objects/observable';
import type {ObservableOptions, Observable} from '~/types';

/* MAIN */

function $ <T> (): Observable<T | undefined>;
function $ <T> ( value: undefined, options?: ObservableOptions<T | undefined> ): Observable<T | undefined>;
function $ <T> ( value: T, options?: ObservableOptions<T> ): Observable<T>;
function $ <T> ( value?: T, options?: ObservableOptions<T | undefined> ) {

  return writable ( new ObservableClass ( value, options ) );

}

/* UTILITIES */

$.batch = batch;
$.boolean = boolean;
$.cleanup = cleanup;
$.context  = context;
$.disposed = disposed;
$.effect = effect;
$.error = error;
$.for = _for;
$.forIndex = forIndex;
$.forValue = forValue;
$.get = get;
$.if = _if;
$.isBatching = isBatching;
$.isObservable = isObservable;
$.isStore = isStore;
$.memo = memo;
$.off = off;
$.on = on;
$.owner = owner;
$.reaction = reaction;
$.readonly = readonly;
$.resolve = resolve;
$.root = root;
$.selector = selector;
$.store = store;
$.suspense = suspense;
$.switch = _switch;
$.ternary = ternary;
$.tryCatch = tryCatch;
$.untrack = untrack;
$.with = _with;

/* EXPORT */

export default $;
