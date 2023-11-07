
/* IMPORT */

import {OWNER, TRACKING} from '../context';
import {ownerWrap} from '../objects/owner';
import type {WithFunction} from '../types';

/* MAIN */

const _with = (): (<T> ( fn: WithFunction<T> ) => T) => {

  const owner = OWNER;
  const tracking = TRACKING;

  return <T> ( fn: WithFunction<T> ): T => {

    return ownerWrap ( fn, owner, tracking );

  };

};

/* EXPORT */

export default _with;
