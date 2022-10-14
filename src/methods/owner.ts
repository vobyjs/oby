
/* IMPORT */

import {OWNER}  from '~/constants';
import Computation from '~/objects/computation';
import Root from '~/objects/root';
import SuperRoot from '~/objects/superroot';
import Suspense from '~/objects/suspense';
import type {Owner} from '~/types';

/* MAIN */

const owner = (): Owner => {

  const isSuperRoot = ( OWNER.current instanceof SuperRoot );
  const isRoot = ( OWNER.current instanceof Root );
  const isSuspense = ( OWNER.current instanceof Suspense );
  const isComputation = ( OWNER.current instanceof Computation );

  return {isSuperRoot, isRoot, isSuspense, isComputation};

};

/* EXPORT */

export default owner;
