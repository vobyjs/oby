
/* IMPORT */

import Scheduler from '~/objects/scheduler.async';

/* MAIN */

const tick = (): void => {

  Scheduler.flush ();

};

/* EXPORT */

export default tick;
