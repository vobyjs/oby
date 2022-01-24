
/* IMPORT */

import {SYMBOL} from './constants';
import {IObservableWithoutInitial, IObservable} from './types';

/* MAIN */

const is = ( value: unknown ): value is IObservableWithoutInitial | IObservable => {

  return typeof value === 'function' && !!value[SYMBOL];

};

/* EXPORT */

export default is;
