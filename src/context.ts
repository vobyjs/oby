
/* IMPORT */

import SuperRoot from '~/objects/superroot';
import type {IObserver, IOwner, IRoot, ISuperRoot} from '~/types';

/* MAIN - READ */

// This module relies on live-binding of exported variables to avoid a bunch of property accesses

let BATCH: Promise<void> | undefined;
let SUPER_OWNER: ISuperRoot = new SuperRoot ();
let OBSERVER: IObserver | undefined;
let OWNER: IOwner = SUPER_OWNER;
let ROOT: IRoot | ISuperRoot = SUPER_OWNER;
let SUSPENSE_ENABLED: boolean = false;

/* MAIN - WRITE */

// Unfortunately live-bounded exports can't just be overridden, so we need these functions

const setBatch = ( value: Promise<void> | undefined ) => BATCH = value;
const setObserver = ( value: IObserver | undefined ) => OBSERVER = value;
const setOwner = ( value: IOwner ) => OWNER = value;
const setRoot = ( value: IRoot | ISuperRoot ) => ROOT = value;
const setSuspenseEnabled = ( value: boolean ) => SUSPENSE_ENABLED = value;

/* EXPORT */

export {BATCH, SUPER_OWNER, OBSERVER, OWNER, ROOT, SUSPENSE_ENABLED};
export {setBatch, setObserver, setOwner, setRoot, setSuspenseEnabled};

//TODO: REVIEW
