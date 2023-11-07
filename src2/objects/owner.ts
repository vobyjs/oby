
/* IMPORT */

import {FLAG_OWNER_DISPOSED, EMPTY_ARRAY, UNAVAILABLE} from '../constants';
import {OWNER, TRACKING, setOwner, setTracking} from '../context';
import {rootIs} from '../objects/root';
import {castError} from '../utils';
import type {Callable, CleanupFunction, WrappedFunction, OwnerState} from '../types';

/* MAIN */

//TODO: Throw when registering stuff after disposing, maybe

const ownerCatch = ( owner: OwnerState, error: Error ): void => {

  const {catchers} = owner;

  for ( let i = 0, l = catchers.length; i < l; i++ ) {

    const catcher = catchers[i].deref (); //TODO: This assumes that the error handler won't throw immediately, which we know, but this function shouldn't know

    if ( !catcher ) continue;

    catcher ( error );

    return;

  }

  // console.error ( error.stack ); // <-- Log "error.stack" to better understand where the error happened

  throw error;

};

const ownerCleanup = ( owner: OwnerState, cleanup: Callable<CleanupFunction> ): void => {

  if ( owner.cleanups === EMPTY_ARRAY ) {

    owner.cleanups = [cleanup];

  } else {

    owner.cleanups.push ( cleanup );

  }

};

const ownerDispose = ( owner: OwnerState, includeSelf: boolean, includeRoot: boolean ): void => {

  if ( !includeRoot && rootIs ( owner ) ) return;

  const {observers} = owner;

  for ( let i = observers.length - 1; i >= 0; i-- ) {

    ownerDispose ( observers[i], true, false );

  }

  const {cleanups} = owner;

  for ( let i = cleanups.length - 1; i >= 0; i-- ) {

    cleanups[i].call ( cleanups[i] );

  }

  const {observables} = owner;

  for ( let i = observables.length - 1; i >= 0; i-- ) {

    //TODO: unlink observable

  }

  owner.flags &= FLAG_OWNER_DISPOSED;
  owner.cleanups = EMPTY_ARRAY;
  owner.observables = EMPTY_ARRAY;
  owner.observers = EMPTY_ARRAY;

};

const ownerDisposed = ( owner: OwnerState ): boolean => {

  return !!( owner.flags & FLAG_OWNER_DISPOSED );

};

const ownerWrap = <T> ( fn: WrappedFunction<T>, owner: OwnerState, tracking: boolean ): T => {

  const ownerPrev = OWNER;
  const trackingPrev = TRACKING;

  setOwner ( owner );
  setTracking ( tracking );

  try {

    return fn ();

  } catch ( error: unknown ) {

    ownerCatch ( owner, castError ( error ) );

    return UNAVAILABLE; // Returning a value that is the least likely to cause bugs

  } finally {

    setOwner ( ownerPrev );
    setTracking ( trackingPrev );

  }

};

/* EXPORT */

export {ownerCatch, ownerCleanup, ownerDispose, ownerDisposed, ownerWrap};
