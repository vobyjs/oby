
/* IMPORT */

import memo from '~/methods/memo';
import resolve from '~/methods/resolve';
import {frozen} from '~/objects/callable';
import {isArray, isFunction} from '~/utils';
import type {ObservableReadonly} from '../types';

/* MAIN */

const resolved = <T> ( value: T ): ObservableReadonly<T> => {

  if ( isArray ( value ) || isFunction ( value ) ) {

    return memo ( () => {

      return resolve ( value );

    });

  } else {

    return frozen ( value );

  }

};

/* EXPORT */

export default resolved;
