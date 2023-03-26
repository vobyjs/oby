
/* IMPORT */

import cleanup from '~/methods/cleanup';
import {readable} from '~/objects/callable';
import Observable from '~/objects/observable';
import type {ObservableReadonly} from '~/types';

/* MAIN */

const disposed = (): ObservableReadonly<boolean> => {

  const observable = new Observable ( false );

  cleanup ( () => {

    observable.write ( true );

  });

  return readable ( observable );

};

/* EXPORT */

export default disposed;

//TODO: REVIEW
