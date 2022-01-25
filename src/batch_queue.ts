
/* IMPORT */

import Observable from './observable';

/* MAIN */

class BatchQueue {

  /* VARIABLES */

  private level: number = 0;
  private map: Map<Observable<any>, unknown> = new Map ();

  /* API */

  isActive (): boolean {

    return this.level > 0;

  }

  flush (): void {

    if ( !this.map.size ) return;

    const map = this.map;

    this.map = new Map ();

    map.forEach ( ( valuePrev, observable ) => {

      observable.emit ( valuePrev );

    });

  }

  push <T> ( observable: Observable<T>, valuePrev: T | undefined ): void {

    if ( this.map.has ( observable ) ) return;

    this.map.set ( observable, valuePrev );

  }

  wrap ( fn: () => void ): void {

    this.level += 1;

    try {

      fn ();

    } catch ( error: unknown ) {

      throw error;

    } finally {

      this.level -= 1;

      if ( !this.isActive () ) {

        this.flush ();

      }

    }

  }

}

/* EXPORT */

export default BatchQueue;
