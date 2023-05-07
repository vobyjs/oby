
/* IMPORT */

import {frozen} from '~/objects/callable';
import type {IObservableParent} from '~/types';

/* MAIN */

const DIRTY_NO: number = 0; // The observer is not dirty, for sure
const DIRTY_MAYBE_NO: number = 1; // The observer is not dirty, possibly
const DIRTY_MAYBE_YES: number = 2; // The observer is dirty, possibly
const DIRTY_YES: number = 3; // The observer is dirty, for sure

const OBSERVABLE_FALSE = frozen ( false );
const OBSERVABLE_TRUE = frozen ( true );
const OBSERVABLE_UNDEFINED = frozen ( undefined );

const OBSERVER_DISPOSED: IObservableParent = { disposed: true, update () {} };

const UNAVAILABLE: any = new Proxy ( function () {}, new Proxy ( {}, { get () { throw new Error ( 'Unavailable value' ) } } ) ); //TSC
const UNINITIALIZED: any = function () {}; //TSC

/* EXPORT */

export {DIRTY_NO, DIRTY_MAYBE_NO, DIRTY_MAYBE_YES, DIRTY_YES};
export {OBSERVABLE_FALSE, OBSERVABLE_TRUE, OBSERVABLE_UNDEFINED};
export {OBSERVER_DISPOSED};
export {UNAVAILABLE, UNINITIALIZED};
