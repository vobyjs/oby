
/* IMPORT */

import {OWNER} from '~/constants';
import type {ErrorFunction} from '~/types';

/* MAIN */

const error = ( fn: ErrorFunction ): void => {

  OWNER.current.registerError ( fn );

};

/* EXPORT */

export default error;
