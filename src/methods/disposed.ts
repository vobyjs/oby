
/* IMPORT */

import cleanup from '~/methods/cleanup';
import Observable from '~/objects/observable';
import type {ObservableReadonly} from '~/types';

/* MAIN */

const disposed = (): ObservableReadonly<boolean> => {

  const observable = new Observable<boolean, boolean> ( false );

  cleanup ( () => {

    observable.set ( true );

  });

  return observable.readable ();

};

/* EXPORT */

export default disposed;
