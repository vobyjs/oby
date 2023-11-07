
/* IMPORT */

import {FLAG_OWNER_DIRTY_YES, EMPTY_ARRAY, UNINITIALIZED} from '../constants';
import {OWNER, TRACKING} from '../context';
import {effectIs, effectStale} from '../objects/effect';
import {memoIs, memoStale} from '../objects/memo';
import {ownerDisposed} from '../objects/owner';
import {is, nope} from '../utils';
import type {UpdateFunction, OwnerState, ObservableState, ObservableOptions} from '../types';

/* MAIN */

function observableNew <T> (): ObservableState<T | undefined>;
function observableNew <T> ( value: undefined, options?: ObservableOptions<T | undefined> ): ObservableState<T | undefined>;
function observableNew <T> ( value: T, options?: ObservableOptions<T> ): ObservableState<T>;
function observableNew <T> ( value?: T, options?: ObservableOptions<T | undefined> ) {

  const equals = options?.equals;

  return {
    equals: ( equals !== undefined ) ? equals || nope : is,
    observers: EMPTY_ARRAY,
    value
  };

}

const observableGet = <T> ( observable: ObservableState<T> ): T => {

  if ( TRACKING && !ownerDisposed ( OWNER ) ) {

    observableLink ( OWNER, observable );

  }

  return observable.value;

};

const observableLink = <T> ( owner: OwnerState, observable: ObservableState<T> ): void => {

  //TODO: Check for duplicates

  if ( owner.observables === EMPTY_ARRAY ) {

    owner.observables = [observable];

  } else {

    owner.observables.push ( observable );

  }

};

const observableSet = <T> ( observable: ObservableState<T>, value: T ): T => {

  const fresh = ( observable.value === UNINITIALIZED ) || !observable.equals ( value, observable.value );

  if ( !fresh ) return value;

  observable.value = value;

  //TODO: Sync scheduler

  observableStale ( observable, FLAG_OWNER_DIRTY_YES );

  return value;

};

const observableStale = <T> ( observable: ObservableState<T>, status: number ): void => {

  const {observers} = observable;

  for ( let i = 0, l = observers.length; i < l; i++ ) {

    const observer = observers[i];

    if ( !( observer.flags & FLAG_OWNER_DIRTY_YES ) ) {

      if ( effectIs ( observer ) ) {

        effectStale ( observer, status );

      } else if ( memoIs ( observer ) ) {

        memoStale ( observer, status );

      }

    }

  }

};

const observableUnlink = <T> ( owner: OwnerState, observable: ObservableState<T> ): void => {

  //TODO: Optimize this

  const index = owner.observables.indexOf ( observable );

  if ( index < 0 ) return;

  owner.observables.splice ( index, 1 );

};

const observableUpdate = <T> ( observable: ObservableState<T>, fn: UpdateFunction<T> ): T => {

  const value = fn ( observable.value );

  return observableSet ( observable, value );

};

/* EXPORT */

export {observableNew, observableGet, observableLink, observableSet, observableStale, observableUnlink, observableUpdate};
