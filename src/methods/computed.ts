
/* IMPORT */

import Computed from '~/objects/computed';
import type {ComputedFunction, ObservableReadonly, ObservableOptions} from '~/types';

/* MAIN */

function computed <T> ( fn: ComputedFunction<T | undefined, T> ): ObservableReadonly<T>;
function computed <T> ( fn: ComputedFunction<T | undefined, T>, valueInitial?: undefined, options?: ObservableOptions<T | undefined> ): ObservableReadonly<T>;
function computed <T> ( fn: ComputedFunction<T, T>, valueInitial: T, options?: ObservableOptions<T> ): ObservableReadonly<T>;
function computed <T> ( fn: ComputedFunction<T | undefined, T>, valueInitial?: T, options?: ObservableOptions<T | undefined> ) {

  return new Computed ( fn, valueInitial, options ).observable.readable ();

}

/* EXPORT */

export default computed;
