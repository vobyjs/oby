
/* IMPORT */

import {OWNER} from '~/constants';
import type {ErrorFunction} from '~/types';

/* MAIN */

const error = ( error: ErrorFunction ): void => {

  OWNER.current.registerError ( error );

};

/* EXPORT */

export default error;
