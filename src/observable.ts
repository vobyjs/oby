
/* IMPORT */

import batch from './batch';
import Computed from './computed';
import Observer from './observer';
import Owner from './owner';
import type {ProduceFunction, SelectFunction, UpdateFunction, ObservableReadonly, ObservableOptions, PlainObservable, PlainObserver} from './types';

/* MAIN */

const Observable = {

  /* REGISTRATION API */

  registerObserver: <T, TI> ( observable: PlainObservable<T, TI>, observer: PlainObserver ): boolean => {

    const set = ( observer.symbol === 3 ) ? observable.computeds : observable.effects;

    const sizePrev = set.size;

    set.add ( observer );

    const sizeNext = set.size;

    return ( sizePrev !== sizeNext );

  },

  unregisterObserver: <T, TI> ( observable: PlainObservable<T, TI>, observer: PlainObserver ): void => {

    const set = ( observer.symbol === 3 ) ? observable.computeds : observable.effects;

    set.delete ( observer );

  },

  registerSelf: <T, TI> ( observable: PlainObservable<T, TI> ): void => {

    if ( observable.disposed ) return;

    Owner.registerObservable ( observable );

    if ( observable.parent && observable.parent.staleCount ) { //FIXME: observable is probably buggy, if it's refreshed early and the counter is reset it may not update itself when one of its dependencies change

      observable.parent.staleCount = 0;
      observable.parent.staleFresh = false;

      Observer.update ( observable.parent, true );

    }

  },

  /* API */

  create: <T, TI> ( value: T, options?: ObservableOptions<T, TI> ): PlainObservable<T, TI> => {

    return {
      symbol: 1,
      disposed: false,
      value,
      listeners: 0,
      listenedValue: undefined,
      comparator: options?.comparator || Object.is,
      computeds: new Set (),
      effects: new Set (),
      parent: undefined
    }

  },

  get: <T, TI> ( observable: PlainObservable<T, TI> ): T | TI => {

    Observable.registerSelf ( observable );

    return observable.value;

  },

  sample: <T, TI> ( observable: PlainObservable<T, TI> ): T | TI => {

    return observable.value;

  },

  select: <T, TI, R> ( observable: PlainObservable<T, TI>, fn: SelectFunction<T | TI, R>, options?: ObservableOptions<R, R> ): ObservableReadonly<R> => {

    return Computed.wrap ( () => {

      return fn ( Observable.get ( observable ) );

    }, undefined, options );

  },

  set: <T, TI> ( observable: PlainObservable<T, TI>, value: T ): T => {

    if ( observable.disposed ) throw new Error ( 'A disposed Observable can not be updated' );

    if ( batch.queue ) {

      batch.queue.set ( observable, value );

      return value;

    } else {

      const fresh = !observable.comparator ( value, observable.value );

      if ( !observable.parent ) {

        Observable.emitStale (observable, fresh );

      }

      const valueNext: T = ( fresh ? value : observable.value ) as any;

      observable.value = valueNext;

      Observable.emitUnstale ( observable, fresh );

      return valueNext;

    }

  },

  produce: <T, TI> ( observable: PlainObservable<T, TI>, fn: ProduceFunction<T | TI, T> ): T => { //TODO: Implement this properly, with good performance and ~arbitrary values support (using immer?)

    const valueClone: T = JSON.parse ( JSON.stringify ( observable.value ) );
    const valueResult = fn ( valueClone );
    const valueNext = ( valueResult === undefined ? valueClone : valueResult );

    return Observable.set ( observable, valueNext );

  },

  update: <T, TI> ( observable: PlainObservable<T, TI>, fn: UpdateFunction<T | TI, T> ): T => {

    const valueNext = fn ( observable.value );

    return Observable.set ( observable, valueNext );

  },

  emit: <T, TI> ( observable: PlainObservable<T, TI>, fresh: boolean ): void => {

    Observable.emitStale ( observable, fresh );
    Observable.emitUnstale ( observable, fresh );

  },

  emitStale: <T, TI> ( observable: PlainObservable<T, TI>, fresh: boolean ): void => {

    if ( observable.disposed ) return;

    for ( const observer of observable.computeds ) {

      Computed.onStale ( observer as any, fresh ); //TSC

    }

    for ( const observer of observable.effects ) {

      Observer.onStale ( observer, fresh );

    }

  },

  emitUnstale: <T, TI> ( observable: PlainObservable<T, TI>, fresh: boolean ): void => {

    if ( observable.disposed ) return;

    //TODO: Maybe clone the queues, though all tests are passing already

    for ( const observer of observable.computeds ) {

      Observer.onUnstale ( observer, fresh );

    }

    for ( const observer of observable.effects ) {

      Observer.onUnstale ( observer, fresh );

    }

  },

  dispose: <T, TI> ( observable: PlainObservable<T, TI> ): void => {

    observable.disposed = true;

  }

};

/* EXPORT */

export default Observable;
