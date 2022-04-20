
/* IMPORT */

import SuperRoot from '~/objects/superroot';
import type {IObserver} from '~/types';

/* MAIN */

const SYMBOL = Symbol ( 'Observable' );
const SUPEROWNER = new SuperRoot ();
const OWNER: { current: IObserver } = { current: SUPEROWNER };
const SAMPLING = { current: false };

/* EXPORT */

export {SYMBOL, SUPEROWNER, OWNER, SAMPLING};
