
/* IMPORT */

import SuperRoot from '~/objects/superroot';
import type {IContext, IObserver, IRoot, ISuperRoot, ISuspense} from '~/types';

/* MAIN - READ */

// This module relies on live-binding of exported variables to avoid a bunch of property accesses

let BATCH: Promise<void> | undefined;
let SUPER_OWNER: ISuperRoot = new SuperRoot ();
let OBSERVER: IObserver | undefined;
let OWNER: IContext | IObserver | IRoot | ISuperRoot | ISuspense = SUPER_OWNER;

/* MAIN - WRITE */

// Unfortunately live-bounded exports can't just be overridden, so we need these functions

const setBatch = ( value: Promise<void> | undefined ) => BATCH = value;
const setObserver = ( value: IObserver | undefined ) => OBSERVER = value;
const setOwner = ( value: IContext | IObserver | IRoot | ISuperRoot | ISuspense ) => OWNER = value;

/* EXPORT */

export {BATCH, OBSERVER, OWNER, SUPER_OWNER};
export {setBatch, setObserver, setOwner};
