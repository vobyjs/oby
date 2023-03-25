
/* IMPORT */

import {BATCH} from '~/context';

/* MAIN */

//TODO: Maybe check if Scheduling is active instead, basically

const isBatching = (): boolean => {

  return !!BATCH;

};

/* EXPORT */

export default isBatching;
