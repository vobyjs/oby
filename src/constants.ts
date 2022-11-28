
/* IMPORT */

import SuperRoot from '~/objects/superroot';
import type {IObservable, IObserver, IRoot, ISuperRoot, ISuspense} from '~/types';

/* MAIN */

const BATCH: { current: Map<IObservable<any>, unknown> | undefined } = { current: undefined };
const BATCH_COUNT = { current: 0 };
const FALSE = () => false;
const IS = Object.is;
const NOOP = () => {};
const SUPER_OWNER = new SuperRoot ();
const OWNER: { current: IObserver } = { current: SUPER_OWNER };
const ROOT: { current: IRoot | ISuperRoot } = { current: SUPER_OWNER };
const SUSPENSE: { current?: ISuspense } = { current: undefined };
const SUSPENSE_ENABLED: { current: boolean } = { current: false };
const SYMBOL_OBSERVABLE = Symbol ( 'Observable' );
const SYMBOL_OBSERVABLE_FROZEN = Symbol ( 'Frozen' );
const SYMBOL_OBSERVABLE_READABLE = Symbol ( 'Readable' );
const SYMBOL_OBSERVABLE_WRITABLE = Symbol ( 'Writable' );
const SYMBOL_STORE = Symbol ( 'Store' );
const SYMBOL_STORE_KEYS = Symbol ( 'Keys' );
const SYMBOL_STORE_OBSERVABLE = Symbol ( 'Observable' );
const SYMBOL_STORE_TARGET = Symbol ( 'Target' );
const SYMBOL_STORE_VALUES = Symbol ( 'Values' );
const SYMBOL_STORE_UNTRACKED = Symbol ( 'Untracked' );
const SYMBOL_SUSPENSE = Symbol ( 'Suspense' );
const SYMBOL_UNCACHED = Symbol ( 'Uncached' );
const SYMBOL_UNTRACKED = Symbol ( 'Untracked' );
const SYMBOL_UNTRACKED_UNWRAPPED = Symbol ( 'Unwrapped' );
const TRACKING = { current: false };

/* EXPORT */

export {BATCH, BATCH_COUNT, FALSE, IS, NOOP, SUPER_OWNER, OWNER, ROOT, SUSPENSE, SUSPENSE_ENABLED, SYMBOL_OBSERVABLE, SYMBOL_OBSERVABLE_FROZEN, SYMBOL_OBSERVABLE_READABLE, SYMBOL_OBSERVABLE_WRITABLE, SYMBOL_STORE, SYMBOL_STORE_KEYS, SYMBOL_STORE_OBSERVABLE, SYMBOL_STORE_TARGET, SYMBOL_STORE_VALUES, SYMBOL_STORE_UNTRACKED, SYMBOL_SUSPENSE, SYMBOL_UNCACHED, SYMBOL_UNTRACKED, SYMBOL_UNTRACKED_UNWRAPPED, TRACKING};
