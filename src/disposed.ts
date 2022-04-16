
/* IMPORT */

import {readable} from './callable';
import Observable from './observable';
import Owner from './owner';
import type {ObservableReadonly} from './types';

/* MAIN */

const disposed = (): ObservableReadonly<boolean> => {

  const observable = Observable.create<boolean, boolean> ( false );

  Owner.registerCleanup ( () => {

    Observable.set ( observable, true );
    Observable.dispose ( observable );

  });

  return readable ( observable );

};

/* EXPORT */

export default disposed;
