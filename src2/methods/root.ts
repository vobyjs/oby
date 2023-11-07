
/* IMPORT */

import {ownerDispose, ownerWrap} from '../objects/owner';
import {rootNew} from '../objects/root';
import type {WrappedDisposableFunction} from '../types';

/* MAIN */

const root = <T> ( fn: WrappedDisposableFunction<T> ): T => {

  const root = rootNew ();
  const dispose = () => ownerDispose ( root, true, true );
  const fnWithDispose = () => fn ( dispose );

  return ownerWrap ( fnWithDispose, root, false );

};

/* EXPORT */

export default root;
