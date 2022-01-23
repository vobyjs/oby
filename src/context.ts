
/* IMPORT */

import Observable from './observable';
import {IListener} from './types';

/* MAIN */

class Context {

  /* VARIABLES */

  private links: WeakMap<IListener, Set<Observable>> = new WeakMap ();
  private listeners: Set<IListener> = new Set ();
  private current: IListener | undefined = undefined;

  /* API */

  link = ( observable: Observable ): void => {

    const listener = this.current;

    if ( !listener ) return;

    observable.on ( listener );

    const links = this.links.get ( listener ) || new Set ();

    links.add ( observable );

    this.links.set ( listener, links );

  }

  unlink = ( listener: IListener ): void => {

    const links = this.links.get ( listener );

    if ( !links ) return;

    links.forEach ( observable => {

      observable.off ( listener );

    });

  }

  with = ( listener: IListener, fn: () => void ): void => {

    if ( this.listeners.has ( listener ) ) throw Error ( 'Circular computation detected' );

    const prev = this.current;

    this.listeners.add ( listener );

    this.current = listener;

    try {

      fn ();

    } finally {

      this.listeners.delete ( listener );

      this.current = prev;

    }

  }

};

/* EXPORT */

export default new Context ();
