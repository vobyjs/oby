
/* MAIN - READ */

let OWNER: OwnerState = superRootNew ();
let TRACKING: boolean = false;

/* MAIN - WRITE */

const setOwner = ( value: OwnerState ) => OWNER = value;
const setTracking = ( value: boolean ) => TRACKING = value;

/* EXPORT */

export {OWNER, TRACKING};
export {setOwner, setTracking};
