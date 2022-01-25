
/* IMPORT */

import callable from './callable';
import computed from './computed';
import from from './from';
import is from './is';
import Observable from './observable';
import batch from './batch';
import {IDisposer, IObservableWithoutInitial, IObservable} from './types';

/* MAIN */

function observable <T> (): IObservableWithoutInitial<T>;
function observable <T> ( value: undefined, disposer?: IDisposer ): IObservableWithoutInitial<T>;
function observable <T> ( value: T, disposer?: IDisposer ): IObservable<T>;
function observable <T> ( value?: T, disposer?: IDisposer ): IObservableWithoutInitial<T> | IObservable<T> {

  return callable ( new Observable ( value, disposer ) ) as any; //TSC

}

observable.batch = batch;
observable.computed = computed;
observable.from = from;
observable.is = is;

/* EXPORT */

export default observable;
