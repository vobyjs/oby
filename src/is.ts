
/* IMPORT */

import Observable from './observable';
import {IObservableWithoutInitial, IObservable} from './types';

/* MAIN */

const is = ( value: unknown ): value is IObservableWithoutInitial | IObservable => {

  return value instanceof Observable;

};

/* EXPORT */

export default is;
