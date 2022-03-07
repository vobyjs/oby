
/* IMPORT */

import Observable from './observable';
import Owner from './owner';
import readable from './readable';
import {ObservableReadonly} from './types';

/* MAIN */

const disposed = (): ObservableReadonly<boolean> => {

  const observable = new Observable ( false );

  Owner.registerCleanup ( () => {

    observable.set ( true );

  });

  return readable ( observable );

};

/* EXPORT */

export default disposed;
