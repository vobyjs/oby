
/* MAIN */

const DIRTY_NO: number = 0; // The observer is not dirty, for sure
const DIRTY_MAYBE_NO: number = 1; // The observer is not dirty, possibly
const DIRTY_MAYBE_YES: number = 2; // The observer is dirty, possibly
const DIRTY_YES: number = 3; // The observer is dirty, for sure

const OBSERVER_DISPOSED = { observables: [], update () {} };

// const UNAVAILABLE: any = new Proxy ( function () {}, new Proxy ( {}, { get () { throw new Error ( 'Unavailable value' ) } } ) );
const UNAVAILABLE: any = undefined; //FIXME: We should really return the exploding proxy, but it probably messes with error boundaries...

/* EXPORT */

export {DIRTY_NO, DIRTY_MAYBE_NO, DIRTY_MAYBE_YES, DIRTY_YES};
export {OBSERVER_DISPOSED};
export {UNAVAILABLE};
