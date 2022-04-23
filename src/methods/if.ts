
/* IMPORT */

import computed from '~/methods/computed';
import type {ObservableReadonly} from '~/types';

/* MAIN */

const _if = <T> ( when: boolean | (() => boolean), value: T ): ObservableReadonly<T | undefined> | T | undefined => {

  if ( typeof when === 'function' ) {

    return computed ( () => {

      if ( when () ) return value;

    });

  } else {

    if ( when ) return value;

  }

};

/* EXPORT */

export default _if;
