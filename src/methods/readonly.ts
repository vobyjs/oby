
/* IMPORT */

import computed from '~/methods/computed';
import type {ObservableReadonly, ObservableAny} from '~/types';

/* MAIN */

const readonly = <T> ( observable: ObservableAny<T> ): ObservableReadonly<T> => {

  return computed<T> ( () => {

    return observable ();

  });

};

/* EXPORT */

export default readonly;
