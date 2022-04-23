
/* IMPORT */

import computed from '~/methods/computed';
import type {ObservableReadonly} from '~/types';

/* MAIN */

const _switch = <T, R> ( when: T | (() => T), values: ([T, R] | [R])[] ): ObservableReadonly<R | undefined> | R | undefined => {

  if ( typeof when === 'function' ) {

    return computed ( () => {

      const condition = ( when as any )(); //TSC

      for ( const value of values ) {

        if ( value.length === 1 ) return value[0];

        if ( value[0] === condition ) return value[1];

      }

    });

  } else {

    for ( const value of values ) {

      if ( value.length === 1 ) return value[0];

      if ( value[0] === when ) return value[1];

    }

  }

};

/* EXPORT */

export default _switch;
