
/* IMPORT */

import computed from '~/methods/computed';
import type {ObservableReadonly} from '~/types';

/* MAIN */

const ternary = <T, F> ( when: boolean | (() => boolean), valueTrue: T, valueFalse: F ): ObservableReadonly<T | F> | T | F => {

  if ( typeof when === 'function' ) {

    return computed ( () => {

      if ( when () ) return valueTrue;

      return valueFalse;

    });

  } else {

    if ( when ) return valueTrue;

    return valueFalse;

  }

};

/* EXPORT */

export default ternary;
