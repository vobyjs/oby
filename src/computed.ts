
/* IMPORT */

import oby from '.';
import Context from './context';
import {IObservable} from './types';

/* MAIN */

const computed = <T> ( fn: () => T ): IObservable<T> => {

  const listener = () => Context.with ( listener, () => observable.set ( fn () ) );
  const disposer = () => Context.unlink ( listener );
  const observable = oby<T> ( undefined, disposer );

  listener ();

  return observable as IObservable<T>; //TSC

};

/* EXPORT */

export default computed;
