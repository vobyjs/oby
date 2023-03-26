
/* IMPORT */

import $ from '~/methods/$';
import batch from '~/methods/batch';
import boolean from '~/methods/boolean';
import cleanup from '~/methods/cleanup';
import context from '~/methods/context';
import disposed from '~/methods/disposed';
import effect from '~/methods/effect';
import _for from '~/methods/for';
import get from '~/methods/get';
import _if from '~/methods/if';
import isBatching from '~/methods/is_batching';
import isObservable from '~/methods/is_observable';
import isStore from '~/methods/is_store';
import memo from '~/methods/memo';
import observable from '~/methods/observable';
import on from '~/methods/on';
import owner from '~/methods/owner';
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
import {SYMBOL_OBSERVABLE, SYMBOL_OBSERVABLE_FROZEN, SYMBOL_OBSERVABLE_READABLE, SYMBOL_OBSERVABLE_WRITABLE, SYMBOL_ON_CALLBACK, SYMBOL_ON_DEPENDENCIES, SYMBOL_STORE, SYMBOL_STORE_KEYS, SYMBOL_STORE_OBSERVABLE, SYMBOL_STORE_VALUES, SYMBOL_UNCACHED, SYMBOL_UNTRACKED, SYMBOL_UNTRACKED_UNWRAPPED} from '~/symbols';
import type {EffectOptions, Observable, ObservableReadonly, ObservableOptions, StoreOptions} from '~/types';

//TODO: KeepAlive (+useContext returns signal?)
//TODO: set observable inside memo throws
//TODO: check places where memo(() => {}) is called
//TODO: callable function for all observers
//TODO: mangle
//TODO: signal/disposed optimization
//TODO: auto-disposing of effects and memos, for memory usage
//TODO: debug function
//TODO: unify for and forValue
//TODO: delete old implementation
//TODO: maybe rename tryCatch to try
//TODO: maybe setting in memos should be forbidden or made explicit at least
//TODO: "val" + "ue" delete

/* EXPORT */

export default $;
export {batch, boolean, cleanup, context, disposed, effect, _for as for, get, _if as if, isBatching, isObservable, isStore, memo, observable, on, owner, readonly, resolve, root, selector, suspense, _switch as switch, store, ternary, tryCatch, untrack, _with as with};
export {SYMBOL_OBSERVABLE, SYMBOL_OBSERVABLE_FROZEN, SYMBOL_OBSERVABLE_READABLE, SYMBOL_OBSERVABLE_WRITABLE, SYMBOL_ON_CALLBACK, SYMBOL_ON_DEPENDENCIES, SYMBOL_STORE, SYMBOL_STORE_KEYS, SYMBOL_STORE_OBSERVABLE, SYMBOL_STORE_VALUES, SYMBOL_UNCACHED, SYMBOL_UNTRACKED, SYMBOL_UNTRACKED_UNWRAPPED};
export type {EffectOptions, Observable, ObservableReadonly, ObservableOptions, StoreOptions};

//TODO: REVIEW
