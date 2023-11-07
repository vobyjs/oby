
/* IMPORT */

import cleanup from '../methods/cleanup';
import {readable} from '../objects/callable';
import {observableNew, observableSet} from '../objects/observable';
import type {ObservableReadonly} from '../types';

/* MAIN */

const disposed = (): ObservableReadonly<boolean> => {

  const observable = observableNew ( false );
  const toggle = () => observableSet ( observable, true );

  cleanup ( toggle );

  return readable ( observable );

};

/* EXPORT */

export default disposed;
