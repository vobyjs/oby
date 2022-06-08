
/* IMPORT */

import isObservable from '~/methods/is_observable';
import type {ObservableReadonly} from '~/types';

/* MAIN */

//TODO: Maybe add a "resolveFunction" argument

const get = <T> ( value: T ): T extends ObservableReadonly<infer U> ? U : T => {

  if ( isObservable ( value ) ) return value () as any; //TSC

  return value as any; //TSC

};

/* EXPORT */

export default get;
