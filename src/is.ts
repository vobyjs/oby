
/* IMPORT */

import {SYMBOL} from './constants';
import {IObservableWithoutInitial, IObservable} from './types';

/* MAIN */

const is = ( value: unknown ): value is IObservableWithoutInitial | IObservable => {

  return !!value && Object.hasOwnProperty.call ( value, SYMBOL );

};

/* EXPORT */

export default is;
