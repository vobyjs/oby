
/* IMPORT */

import Observer from './observer';
import Owner from './owner';
import {OwnerFunction} from './types';

/* MAIN */

class Root extends Observer {

  /* STATIC API */

  static wrap <T> ( fn: OwnerFunction<T> ): void {

    const root = new Root ();

    try {

      Owner.wrapWith ( fn, root, true );

    } catch ( error: unknown ) {

      root.updateError ( error );

    }

  }

}

/* EXPORT */

export default Root;
