
/* IMPORT */

import {OWNER} from '../context';
import {contextIs} from '../objects/context';
import {effectIs}  from '../objects/effect';
import {errorIs}  from '../objects/error';
import {memoIs} from '../objects/memo';
import {rootIs} from '../objects/root';
import {superRootIs} from '../objects/superroot';
import {suspenseIs} from '../objects/suspense';
import type {Owner} from '../types';

/* MAIN */

const owner = (): Owner => {

  const isContext = contextIs ( OWNER );
  const isEffect = effectIs ( OWNER );
  const isError = errorIs ( OWNER );
  const isMemo = memoIs ( OWNER );
  const isRoot = rootIs ( OWNER );
  const isSuperRoot = superRootIs ( OWNER );
  const isSuspense = suspenseIs ( OWNER );

  return {isContext, isEffect, isError, isMemo, isRoot, isSuperRoot, isSuspense};

};

/* EXPORT */

export default owner;
