
/* IMPORT */

import {OWNER} from '~/constants';
import type {ErrorFunction, Callable} from '~/types';

/* MAIN */

const error = ( fn: Callable<ErrorFunction> ): void => {

  OWNER.current.registerError ( fn );

};

/* EXPORT */

export default error;
