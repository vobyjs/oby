
/* IMPORT */

import symbol from './symbol';
import type {ObservableAny} from './types';

/* MAIN */

const is = <T = unknown> ( value: unknown ): value is ObservableAny<T> => {

  return ( typeof value === 'function' ) && ( symbol in value );

};

/* EXPORT */

export default is;
