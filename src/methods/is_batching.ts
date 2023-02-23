
/* IMPORT */

import {BATCH} from '~/constants';

/* MAIN */

const isBatching = (): boolean => {

  return !!BATCH.current;

};

/* EXPORT */

export default isBatching;
