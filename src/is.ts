
/* IMPORT */

import {SYMBOL} from './constants';
import {IObservableWithoutInitial, IObservable} from './types';

/* MAIN */

const is = ( value: any ): value is IObservableWithoutInitial | IObservable => {

  return value != null && !!value[SYMBOL];

};

/* EXPORT */

export default is;
