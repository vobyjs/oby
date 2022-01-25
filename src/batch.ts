
/* IMPORT */

import BatchQueue from './batch_queue';

/* MAIN */

const batch = ( fn: () => void ): void => {

  return batch.queue.wrap ( fn );

};

batch.queue = new BatchQueue ();

/* EXPORT */

export default batch;
