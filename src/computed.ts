
/* IMPORT */

import oby from '.';
import Context from './context';
import {IObservable} from './types';

/* MAIN */

const computed = <T> ( fn: () => T ): IObservable<T> => {

  const computation = () => Context.with ( computation, () => observable.set ( fn () ) );
  const observable = oby<T> ();

  computation ();

  return observable as IObservable<T>; //TSC

};

/* EXPORT */

export default computed;
