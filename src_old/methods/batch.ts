
/* IMPORT */

import {BATCH, setBatch} from '~/context';
import type {IObservable, BatchFunction} from '~/types';

/* HELPERS - LIFECYCLE */

const start = (): void => {

  setBatch ( new Map () );

};

const stop = (): void => {

  const batch = BATCH;

  if ( !batch ) return;

  setBatch ();

  if ( batch.size > 1 ) {

    batch.forEach ( stale );
    batch.forEach ( write );
    batch.forEach ( unstale );

  } else {

    batch.forEach ( write );

  }

};

const wrap = <T> ( fn: () => T, onBefore: () => void, onAfter: () => void ): T => {

  onBefore ();

  try {

    const result = fn ();

    if ( result instanceof Promise ) {

      result.finally ( onAfter );

    } else {

      onAfter ();

    }

    return result;

  } catch ( error: unknown ) {

    onAfter ();

    throw error;

  }

};

/* HELPERS - FLUSHING */

const stale = <T> ( value: T, observable: IObservable<T> ): void => {

  observable.emit ( 1, false );

};

const unstale = <T> ( value: T, observable: IObservable<T> ): void => {

  observable.emit ( -1, false );

};

const write = <T> ( value: T, observable: IObservable<T> ): void => {

  observable.write ( value );

};

/* MAIN */

//TODO: Experiment with deleting batching and instead "just" queuing stuff in a microtask, if possible without making a mess in userland
//FIXME: Batching seems to be somewhat broken, if it only parts of an update are wrapped in a batch it's possible to see glitches

const batch = <T> ( fn: BatchFunction<T> ): T => {

  if ( BATCH ) {

    return fn ();

  } else {

    return wrap ( fn, start, stop );

  }

};

/* MAIN */

export default batch;
