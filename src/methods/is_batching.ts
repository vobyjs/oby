
/* IMPORT */

import {BATCH} from '~/context';
import SchedulerAsync from '~/objects/scheduler.async';
import SchedulerSync from '~/objects/scheduler.sync';

/* MAIN */

const isBatching = (): boolean => {

  return !!BATCH || SchedulerAsync.queued || SchedulerAsync.locked || SchedulerSync.locked;

};

/* EXPORT */

export default isBatching;
