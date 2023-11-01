
//TODO: Explore making setting observables inside effects and memos more explicit/strict
//TODO: Explore using Solid's double-array optimization to delete the Set
//TODO: Support auto-disposing of effects and memos (free up some memory)
//TODO: Support frozen observables more deeply again
//TODO: Support faster cleanups based on root disposal
//TODO: Support pooling in keyed $.for

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
import owner from '~/methods/owner';
import readonly from '~/methods/readonly';
import resolve from '~/methods/resolve';
import root from '~/methods/root';
import selector from '~/methods/selector';
import store from '~/methods/store';
import suspended from '~/methods/suspended';
import suspense from '~/methods/suspense';
import _switch from '~/methods/switch';
import ternary from '~/methods/ternary';
import tick from '~/methods/tick';
import tryCatch from '~/methods/try_catch';
import untrack from '~/methods/untrack';
import untracked from '~/methods/untracked';
import _with from '~/methods/with';
import {SYMBOL_OBSERVABLE, SYMBOL_OBSERVABLE_BOOLEAN, SYMBOL_OBSERVABLE_FROZEN, SYMBOL_OBSERVABLE_READABLE, SYMBOL_OBSERVABLE_WRITABLE, SYMBOL_STORE, SYMBOL_STORE_KEYS, SYMBOL_STORE_OBSERVABLE, SYMBOL_STORE_TARGET, SYMBOL_STORE_VALUES, SYMBOL_UNCACHED, SYMBOL_UNTRACKED, SYMBOL_UNTRACKED_UNWRAPPED} from '~/symbols';
import type {EffectOptions, ForOptions, MemoOptions, Observable, ObservableLike, ObservableReadonly, ObservableReadonlyLike, ObservableOptions, StoreOptions} from '~/types';

/* EXPORT */

export default $;
export {batch, boolean, cleanup, context, disposed, effect, _for as for, get, _if as if, isBatching, isObservable, isStore, memo, observable, owner, readonly, resolve, root, selector, store, suspended, suspense, _switch as switch, ternary, tick, tryCatch, untrack, untracked, _with as with};
export {SYMBOL_OBSERVABLE, SYMBOL_OBSERVABLE_BOOLEAN, SYMBOL_OBSERVABLE_FROZEN, SYMBOL_OBSERVABLE_READABLE, SYMBOL_OBSERVABLE_WRITABLE, SYMBOL_STORE, SYMBOL_STORE_KEYS, SYMBOL_STORE_OBSERVABLE, SYMBOL_STORE_TARGET, SYMBOL_STORE_VALUES, SYMBOL_UNCACHED, SYMBOL_UNTRACKED, SYMBOL_UNTRACKED_UNWRAPPED};
export type {EffectOptions, ForOptions, MemoOptions, Observable, ObservableLike, ObservableReadonly, ObservableReadonlyLike, ObservableOptions, StoreOptions};
