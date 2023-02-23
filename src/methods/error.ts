
/* IMPORT */

import {OWNER} from '~/context';
import type {ErrorFunction, Callable} from '~/types';

/* MAIN */

const error = ( fn: Callable<ErrorFunction> ): void => {

  OWNER.registerError ( fn );

};

/* EXPORT */

export default error;
