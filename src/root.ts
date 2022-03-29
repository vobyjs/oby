
/* IMPORT */

import Observer from './observer';
import Owner from './owner';
import {OwnerFunction} from './types';

/* MAIN */

class Root extends Observer {

  /* STATIC API */

  static wrap <T> ( fn: OwnerFunction<T> ): T {

    const root = new Root ();

    let result: T;

    try {

      result = Owner.wrapWith ( fn, root, true );

    } catch ( error: unknown ) {

      root.updateError ( error );

    }

    return result!;

  }

}

/* EXPORT */

export default Root;
