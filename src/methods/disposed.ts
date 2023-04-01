
/* IMPORT */

import cleanup from '~/methods/cleanup';
import {readable} from '~/objects/callable';
import Observable from '~/objects/observable';
import type {ObservableReadonly} from '~/types';

/* MAIN */

const disposed = (): ObservableReadonly<boolean> => {

  const observable = new Observable ( false );
  const toggle = () => observable.set ( true );

  cleanup ( toggle );

  return readable ( observable );

};

/* EXPORT */

export default disposed;
