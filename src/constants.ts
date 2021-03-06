
/* IMPORT */

import SuperRoot from '~/objects/superroot';
import type {IObservable, IObserver, IRoot, ISuperRoot, ISuspense} from '~/types';

/* MAIN */

const BATCH: { current: Map<IObservable<any>, unknown> | undefined } = { current: undefined };
const FALSE = () => false;
const IS = Object.is;
const NOOP = () => {};
const SUPER_OWNER = new SuperRoot ();
const OWNER: { current: IObserver } = { current: SUPER_OWNER };
const ROOT: { current: IRoot | ISuperRoot } = { current: SUPER_OWNER };
const SAMPLING = { current: false };
const SUSPENSE: { current?: ISuspense } = { current: undefined };
const SUSPENSE_ENABLED: { current: boolean } = { current: false };
const SYMBOL_OBSERVABLE = Symbol ( 'Observable' );
const SYMBOL_OBSERVABLE_FROZEN = Symbol ( 'Frozen' );
const SYMBOL_OBSERVABLE_READABLE = Symbol ( 'Readable' );
const SYMBOL_OBSERVABLE_WRITABLE = Symbol ( 'Writable' );
const SYMBOL_RESOLVE_UNWRAPPED = Symbol ( 'Unwrapped' );
const SYMBOL_SAMPLED = Symbol ( 'Sampled' );
const SYMBOL_STORE = Symbol ( 'Store' );
const SYMBOL_STORE_OBSERVABLE = Symbol ( 'Observable' );
const SYMBOL_STORE_TARGET = Symbol ( 'Target' );
const SYMBOL_STORE_VALUES = Symbol ( 'Values' );
const SYMBOL_SUSPENSE = Symbol ( 'Suspense' );
const TRUE = () => true;

/* EXPORT */

export {BATCH, FALSE, IS, NOOP, SUPER_OWNER, OWNER, ROOT, SAMPLING, SUSPENSE, SUSPENSE_ENABLED, SYMBOL_OBSERVABLE, SYMBOL_OBSERVABLE_FROZEN, SYMBOL_OBSERVABLE_READABLE, SYMBOL_OBSERVABLE_WRITABLE, SYMBOL_RESOLVE_UNWRAPPED, SYMBOL_SAMPLED, SYMBOL_STORE, SYMBOL_STORE_OBSERVABLE, SYMBOL_STORE_TARGET, SYMBOL_STORE_VALUES, SYMBOL_SUSPENSE, TRUE};
