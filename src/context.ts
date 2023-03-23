
/* IMPORT */

import SuperRoot from '~/objects/superroot';
import type {IObserver, IOwner, IRoot, ISuperRoot} from '~/types';

/* MAIN - READ */

// This module relies on live-binding of exported variables to avoid a bunch of property accesses

let SUPER_OWNER: ISuperRoot = new SuperRoot ();
let OBSERVER: IObserver | undefined;
let OWNER: IOwner = SUPER_OWNER;
let ROOT: IRoot | ISuperRoot = SUPER_OWNER;

/* MAIN - WRITE */

// Unfortunately live-bounded exports can't just be overridden, so we need these functions

const setObserver = ( value: IObserver | undefined ) => OBSERVER = value;
const setOwner = ( value: IOwner ) => OWNER = value;
const setRoot = ( value: IRoot | ISuperRoot ) => ROOT = value;

/* EXPORT */

export {OBSERVER, OWNER, ROOT};
export {setObserver, setOwner, setRoot};
