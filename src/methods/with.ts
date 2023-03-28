
/* IMPORT */

import {OBSERVER, OWNER} from '~/context';
import type {WithFunction} from '~/types';

/* MAIN */

const _with = (): (<T> ( fn: WithFunction<T> ) => T) => {

  const owner = OWNER;
  const observer = OBSERVER;

  return <T> ( fn: WithFunction<T> ): T => {

    return owner.wrap ( () => fn (), owner, observer );

  };

};

/* EXPORT */

export default _with;
