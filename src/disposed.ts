
/* IMPORT */

import observable from '.';
import Owner from './owner';
import {ReadonlyObservableCallable} from './types';

/* MAIN */

const disposed = (): ReadonlyObservableCallable<boolean> => {

  const value = observable ( false );

  Owner.registerCleanup ( () => {

    value ( true );

  });

  return value;

};

/* EXPORT */

export default disposed;
