
/* IMPORT */

import SuperRoot from '~/objects/superroot';
import type {IObservable, IObserver, IRoot, ISuperRoot, ISuspense} from '~/types';

/* MAIN - READ */

// This module relies on live-binding of exported variables to avoid a bunch of property accesses

let SUPER_OWNER = new SuperRoot ();
let BATCH: Map<IObservable<any>, unknown> | undefined;
let OWNER: IObserver = SUPER_OWNER;
let ROOT: IRoot | ISuperRoot = SUPER_OWNER;
let SUSPENSE: ISuspense | undefined;
let SUSPENSE_ENABLED: boolean = false;
let TRACKING: boolean = false;

/* MAIN - WRITE */

// Unfortunately live-bounded exports can't just be overridden, so we need these functions

const setBatch = ( value?: Map<IObservable<any>, unknown> ) => BATCH = value;
const setOwner = ( value: IObserver ) => OWNER = value;
const setRoot = ( value: IRoot | ISuperRoot ) => ROOT = value;
const setSuspense = ( value?: ISuspense ) => SUSPENSE = value;
const setSuspenseEnabled = ( value: boolean ) => SUSPENSE_ENABLED = value;
const setTracking = ( value: boolean ) => TRACKING = value;

/* EXPORT */

export {BATCH, SUPER_OWNER, OWNER, ROOT, SUSPENSE, SUSPENSE_ENABLED, TRACKING};
export {setBatch, setOwner, setRoot, setSuspense, setSuspenseEnabled, setTracking};
