
/* IMPORT */

import {OWNER} from '~/context';
import type {WithFunction} from '~/types';

/* MAIN */

const _with = (): (<T> ( fn: WithFunction<T> ) => T) => {

  const owner = OWNER;

  return <T> ( fn: WithFunction<T> ): T => {

    return owner.wrap ( () => fn () );

  };

};

/* EXPORT */

export default _with;
