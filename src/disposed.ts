
/* IMPORT */

import {readable} from './callable';
import Observable from './observable';
import Owner from './owner';
import {ObservableReadonly} from './types';

/* MAIN */

const disposed = (): ObservableReadonly<boolean> => {

  const observable = new Observable ( false );

  Owner.registerCleanup ( () => {

    observable.set ( true );
    observable.dispose ();

  });

  return readable ( observable );

};

/* EXPORT */

export default disposed;
