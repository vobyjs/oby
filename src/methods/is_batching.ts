
/* IMPORT */

import {BATCH} from '~/context';

/* MAIN */

const isBatching = (): boolean => {

  return !!BATCH;

};

/* EXPORT */

export default isBatching;
