
/* IMPORT */

// imp batch from '~/methods/batch';
import boolean from '~/methods/boolean';
import cleanup from '~/methods/cleanup';
import context from '~/methods/context';
import disposed from '~/methods/disposed';
import effect from '~/methods/effect';
// imp error from '~/methods/error';
// imp _for from '~/methods/for';
// imp forIndex from '~/methods/for_index';
// imp forValue from '~/methods/for_value';
import get from '~/methods/get';
import _if from '~/methods/if';
// imp isBatching from '~/methods/is_batching';
import isObservable from '~/methods/is_observable';
// imp isStore from '~/methods/is_store';
import memo from '~/methods/memo';
// imp off from '~/methods/off';
// imp on from '~/methods/on';
import owner from '~/methods/owner';
import reaction from '~/methods/reaction';
import readonly from '~/methods/readonly';
import resolve from '~/methods/resolve';
import root from '~/methods/root';
import selector from '~/methods/selector';
// imp store from '~/methods/store';
// imp suspense from '~/methods/suspense';
import _switch from '~/methods/switch';
import ternary from '~/methods/ternary';
// imp tryCatch from '~/methods/try_catch';
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

// $.batch = batch;
$.boolean = boolean;
$.cleanup = cleanup;
$.context  = context;
$.disposed = disposed;
$.effect = effect;
// $.error = error;
// $.for = _for;
// $.forIndex = forIndex;
// $.forValue = forValue;
$.get = get;
$.if = _if;
// $.isBatching = isBatching;
$.isObservable = isObservable;
// $.isStore = isStore;
$.memo = memo;
// $.off = off;
// $.on = on;
$.owner = owner;
$.reaction = reaction;
$.readonly = readonly;
$.resolve = resolve;
$.root = root;
$.selector = selector;
// $.store = store;
// $.suspense = suspense;
$.switch = _switch;
$.ternary = ternary;
// $.tryCatch = tryCatch;
$.untrack = untrack;
$.with = _with;

/* EXPORT */

export default $;
