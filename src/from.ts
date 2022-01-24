
/* IMPORT */

import oby from '.';
import {IDisposer, IObservableWithoutInitial} from './types';

/* MAIN */

const from = <T> ( fn: ( observable: IObservableWithoutInitial<T> ) => IDisposer | void ): IObservableWithoutInitial<T> => {

  const disposer = () => cleanup && cleanup ();
  const observable = oby<T> ( undefined, disposer );
  const cleanup = fn ( observable );

  return observable;

};

/* EXPORT */

export default from;
