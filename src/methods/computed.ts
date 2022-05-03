
/* IMPORT */

import Computed from '~/objects/computed';
import Observable from '~/objects/observable';
import type {ComputedFunction, ObservableReadonly, ObservableOptions} from '~/types';

/* HELPERS */

const DUMMY_FN = (): any => {};
const DUMMY_OBSERVABLE = new Observable<any> ( undefined );

/* MAIN */

function computed <T> ( fn: ComputedFunction<T | undefined, T> ): ObservableReadonly<T>;
function computed <T> ( fn: ComputedFunction<T | undefined, T>, valueInitial?: undefined, options?: ObservableOptions<T | undefined> ): ObservableReadonly<T>;
function computed <T> ( fn: ComputedFunction<T, T>, valueInitial: T, options?: ObservableOptions<T> ): ObservableReadonly<T>;
function computed <T> ( fn: ComputedFunction<T | undefined, T>, valueInitial?: T, options?: ObservableOptions<T | undefined> ) {

  const computed = new Computed ( fn, valueInitial, options );
  const {observable} = computed;

  if ( !computed.observables ) { // It can never run again, freeing up some memory and returning a cheaper frozen observable

    computed.fn = DUMMY_FN;
    computed.observable = DUMMY_OBSERVABLE;

    return observable.frozen ();

  } else { // It could run again, returning a regular readable observable

    return observable.readable ();

  }

}

/* EXPORT */

export default computed;
