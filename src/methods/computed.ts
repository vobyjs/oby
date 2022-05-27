
/* IMPORT */

import {frozen, readable} from '~/objects/callable';
import Computed from '~/objects/computed';
import Observable from '~/objects/observable';
import type {ComputedFunction, ObservableReadonly, ObservableOptions} from '~/types';

/* HELPERS */

const DUMMY_FN = (): any => {};
const DUMMY_OBSERVABLE = new Observable<any> ( undefined );

/* MAIN */

const computed = <T> ( fn: ComputedFunction<T>, options?: ObservableOptions<T | undefined> ): ObservableReadonly<T> => {

  const computed = new Computed ( fn, options );
  const {observable} = computed;

  if ( !computed.observables ) { // It can never run again, freeing up some memory and returning a cheaper frozen observable

    computed.fn = DUMMY_FN;
    computed.observable = DUMMY_OBSERVABLE;

    return frozen ( observable.value );

  } else { // It could run again, returning a regular readable observable

    return readable ( observable );

  }

};

/* EXPORT */

export default computed;
