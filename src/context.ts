
/* IMPORT */

import SuperRoot from '~/objects/superroot';
import type {IObserver, IRoot, ISuperRoot, ISuspense} from '~/types';

/* MAIN - READ */

// This module relies on live-binding of exported variables to avoid a bunch of property accesses

let BATCH: Promise<void> | undefined;
let SUPER_OWNER: ISuperRoot = new SuperRoot ();
let OBSERVER: IObserver | undefined;
let OWNER: IObserver | IRoot | ISuperRoot | ISuspense = SUPER_OWNER;
let SUSPENSE_ENABLED: boolean = false;

/* MAIN - WRITE */

// Unfortunately live-bounded exports can't just be overridden, so we need these functions

const setBatch = ( value: Promise<void> | undefined ) => BATCH = value;
const setObserver = ( value: IObserver | undefined ) => OBSERVER = value;
const setOwner = ( value: IObserver | IRoot | ISuperRoot | ISuspense ) => OWNER = value;
const setSuspenseEnabled = ( value: boolean ) => SUSPENSE_ENABLED = value;

/* EXPORT */

export {BATCH, OBSERVER, OWNER, SUPER_OWNER, SUSPENSE_ENABLED};
export {setBatch, setObserver, setOwner, setSuspenseEnabled};
