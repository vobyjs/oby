
/* IMPORT */

import Observer from '~/objects/observer';
import Signal from '~/objects/signal';
import type {ISignal} from '~/types';

/* MAIN */

class SuperRoot extends Observer {

  /* VARIABLES */

  parent: undefined;
  signal: ISignal = new Signal ();

}

/* EXPORT */

export default SuperRoot;
