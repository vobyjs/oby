
/* IMPORT */

import {OWNER} from '~/constants';
import type {WithFunction} from '~/types';

/* MAIN */

const _with = (): (<T> ( fn: WithFunction<T> ) => T) => {

  const owner = OWNER.current;

  return <T> ( fn: WithFunction<T> ): T => {

    return owner.wrap ( () => fn () );

  };

};

/* EXPORT */

export default _with;
