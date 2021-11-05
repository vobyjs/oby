
/* IMPORT */

import oby from '.';
import {NOOP} from './constants';
import {IDisposer, IObservableWithoutInitial} from './types';

/* MAIN */

const from = <T> ( fn: ( observable: IObservableWithoutInitial<T> ) => IDisposer | void ): IObservableWithoutInitial<T> => {

  const disposer = () => cleanup ();
  const observable = oby<T> ( undefined, disposer );
  const cleanup = fn ( observable ) || NOOP;

  return observable;

};

/* EXPORT */

export default from;
