
/* IMPORT */

import computed from '~/methods/computed';
import type {Observable, ObservableReadonly} from '~/types';

/* MAIN */

const readonly = <T> ( observable: Observable<T> | ObservableReadonly<T> ): ObservableReadonly<T> => {

  return computed ( observable );

};

/* EXPORT */

export default readonly;
