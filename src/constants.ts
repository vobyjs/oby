
/* IMPORT */

import SuperRoot from '~/objects/superroot';
import type { IObservable, IObserver } from '~/types';

/* MAIN */

const BATCH: { current: Map<IObservable<any>, unknown> | undefined } = { current: undefined };
const FALSE = () => false;
const NOOP = () => {};
const OWNER: { current: IObserver } = { current: new SuperRoot () };
const SAMPLING = { current: false };
const SYMBOL = Symbol ( 'Observable' );

/* EXPORT */

export {BATCH, FALSE, NOOP, OWNER, SAMPLING, SYMBOL};
