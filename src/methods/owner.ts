
/* IMPORT */

import {OWNER} from '~/context';
import Observer from '~/objects/observer';
import Root from '~/objects/root';
import SuperRoot from '~/objects/superroot';
import Suspense from '~/objects/suspense';
import type {Owner} from '~/types';

/* MAIN */

const owner = (): Owner => {

  const isSuperRoot = ( OWNER instanceof SuperRoot );
  const isRoot = ( OWNER instanceof Root );
  const isSuspense = ( OWNER instanceof Suspense );
  const isComputation = ( OWNER instanceof Observer );

  return {isSuperRoot, isRoot, isSuspense, isComputation};

};

/* EXPORT */

export default owner;
