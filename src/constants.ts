
/* IMPORT */

import SuperRoot from '~/objects/superroot';
import type {IObservable, IObserver, IRoot, ISuperRoot, ISuspense} from '~/types';

/* MAIN */

const BATCH: { current: Map<IObservable<any>, unknown> | undefined } = { current: undefined };
const SUPER_OWNER = new SuperRoot ();
const OWNER: { current: IObserver } = { current: SUPER_OWNER };
const ROOT: { current: IRoot | ISuperRoot } = { current: SUPER_OWNER };
const SUSPENSE: { current?: ISuspense } = { current: undefined };
const SUSPENSE_ENABLED: { current: boolean } = { current: false };
const TRACKING = { current: false };

/* EXPORT */

export {BATCH, SUPER_OWNER, OWNER, ROOT, SUSPENSE, SUSPENSE_ENABLED, TRACKING};
