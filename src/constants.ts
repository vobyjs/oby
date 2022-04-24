
/* IMPORT */

import SuperRoot from '~/objects/superroot';
import type {IObserver} from '~/types';

/* MAIN */

const OWNER: { current: IObserver } = { current: new SuperRoot () };
const SAMPLING = { current: false };
const SYMBOL = Symbol ( 'Observable' );

/* EXPORT */

export {OWNER, SAMPLING, SYMBOL};
