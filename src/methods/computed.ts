
/* IMPORT */

import Computed from '~/objects/computed';
import type {ComputedFunction, ObservableReadonly, ObservableOptions} from '~/types';

/* MAIN */

function computed <T> ( fn: ComputedFunction<T, T | undefined> ): ObservableReadonly<T>;
function computed <T> ( fn: ComputedFunction<T, T | undefined>, value: undefined, options?: ObservableOptions<T, T | undefined> ): ObservableReadonly<T>;
function computed <T> ( fn: ComputedFunction<T, T>, value: T, options?: ObservableOptions<T, T> ): ObservableReadonly<T>;
function computed <T> ( fn: ComputedFunction<T, T | undefined>, value?: T, options?: ObservableOptions<T, T | undefined> ) {

  return new Computed ( fn, value, options ).observable.readable ();

}

/* EXPORT */

export default computed;
