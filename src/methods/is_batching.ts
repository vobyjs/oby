
/* IMPORT */

import {BATCH_COUNT} from '~/constants';

/* MAIN */

const isBatching = (): boolean => {

  return !!BATCH_COUNT.current;

};

/* EXPORT */

export default isBatching;
