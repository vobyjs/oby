
/* IMPORT */

import observable from '.';
import Context from './context';
import {ReadonlyObservableCallable} from './types';

/* MAIN */

const disposed = (): ReadonlyObservableCallable<boolean> => {

  const value = observable ( false );

  Context.registerCleanup ( () => {

    value ( true );

  });

  return value;

};

/* EXPORT */

export default disposed;
