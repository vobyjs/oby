
/* IMPORT */

import observable from '.';
import Owner from './owner';
import {ObservableReadonly} from './types';

/* MAIN */

const disposed = (): ObservableReadonly<boolean> => {

  const value = observable ( false );

  Owner.registerCleanup ( () => {

    value ( true );

  });

  return value;

};

/* EXPORT */

export default disposed;
