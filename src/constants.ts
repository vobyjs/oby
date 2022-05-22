
/* IMPORT */

import SuperRoot from '~/objects/superroot';
import type {IObservable, IObserver, IRoot, ISuperRoot} from '~/types';

/* MAIN */

const BATCH: { current: Map<IObservable<any>, unknown> | undefined } = { current: undefined };
const FALSE = () => false;
const NOOP = () => {};
const SUPER_OWNER = new SuperRoot ();
const OWNER: { current: IObserver } = { current: SUPER_OWNER };
const ROOT: { current: IRoot | ISuperRoot } = { current: SUPER_OWNER };
const SAMPLING = { current: false };
const SYMBOL_OBSERVABLE = Symbol ( 'Observable' );
const SYMBOL_SAMPLED = Symbol ( 'Sampled' );

/* EXPORT */

export {BATCH, FALSE, NOOP, SUPER_OWNER, OWNER, ROOT, SAMPLING, SYMBOL_OBSERVABLE, SYMBOL_SAMPLED};
