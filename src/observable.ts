
/* IMPORT */

import batch from './batch';
import Computed from './computed';
import Owner from './owner';
import Reaction from './reaction';
import symbol from './symbol';
import type {ProduceFunction, SelectFunction, UpdateFunction, ObservableReadonly, ObservableAny, ObservableOptions, PlainObservable, PlainObserver, PlainReaction} from './types';

/* MAIN */

const Observable = {

  /* REGISTRATION API */

  registerObserver: <T, TI> ( observable: PlainObservable<T, TI>, observer: PlainObserver ): boolean => {

    const observers = observable.observers;

    if ( observers ) {

      if ( observers instanceof Set ) {

        const sizePrev = observers.size;

        observers.add ( observer );

        const sizeNext = observers.size;

        return ( sizePrev !== sizeNext );

      } else if ( observers === observer ) {

        return false;

      } else {

        const observersNext = new Set<PlainObserver> ();

        observersNext.add ( observers );
        observersNext.add ( observer );

        observable.observers = observersNext;

        return true;

      }

    } else {

      observable.observers = observer;

      return true;

    }

  },

  unregisterObserver: <T, TI> ( observable: PlainObservable<T, TI>, observer: PlainObserver ): void => {

    if ( !observable.observers ) return;

    if ( observable.observers instanceof Set ) {

      observable.observers.delete ( observer );

    } else if ( observable.observers === observer ) {

      observable.observers = null;

    }

  },

  registerSelf: <T, TI> ( observable: PlainObservable<T, TI> ): void => {

    if ( observable.disposed ) return;

    Owner.registerObservable ( observable );

    if ( observable.parent && observable.parent.stale ) {

      observable.parent.stale = 0;

      Computed.update ( observable.parent, true );

    }

  },

  /* API */

  create: <T, TI> ( value: T | TI, options?: ObservableOptions<T, TI> ): PlainObservable<T, TI> => {

    return {
      value,
      comparator: options?.comparator || null,
      observers: null,
      parent: null,
      disposed: false
    };

  },

  get: <T, TI> ( observable: PlainObservable<T, TI> ): T | TI => {

    Observable.registerSelf ( observable );

    return observable.value;

  },

  sample: <T, TI> ( observable: PlainObservable<T, TI> ): T | TI => {

    return observable.value;

  },

  select: <T, TI, R> ( observable: PlainObservable<T, TI>, fn: SelectFunction<T | TI, R>, options?: ObservableOptions<R, R | undefined> ): ObservableReadonly<R> => {

    const update = (): R => fn ( Observable.get ( observable ) );

    return Computed.wrap ( update, undefined, options );

  },

  set: <T, TI> ( observable: PlainObservable<T, TI>, value: T ): T => {

    if ( observable.disposed ) throw new Error ( 'A disposed Observable can not be updated' );

    if ( batch.queue ) {

      batch.queue.set ( observable, value );

      return value;

    } else {

      const comparator = observable.comparator || Object.is;
      const fresh = !comparator ( value, observable.value );

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

    if ( !observable.observers ) return;

    if ( observable.observers instanceof Set ) {

      for ( const observer of observable.observers ) {

        Reaction.stale ( observer as PlainReaction, fresh ); //TSC

      }

    } else {

      Reaction.stale ( observable.observers as PlainReaction, fresh ); //TSC

    }

  },

  emitUnstale: <T, TI> ( observable: PlainObservable<T, TI>, fresh: boolean ): void => {

    if ( observable.disposed ) return;

    if ( !observable.observers ) return;

    if ( observable.observers instanceof Set ) {

      const set = observable.observers;
      const queue = Array.from ( set ); //TODO: Could cloning be avoided?

      for ( let i = 0, l = queue.length; i < l; i++ ) {

        const observer = queue[i];

        if ( !set.has ( observer ) ) continue;

        Reaction.unstale ( observer as PlainReaction, fresh ); //TSC

      }

    } else {

      Reaction.unstale ( observable.observers as PlainReaction, fresh ); //TSC

    }

  },

  target: <T> ( observable: ObservableAny<T> ): PlainObservable<T, T | undefined> => {

    return ( observable as any )( symbol ); //TSC

  },

  dispose: <T, TI> ( observable: PlainObservable<T, TI> ): void => {

    observable.disposed = true;

  }

};

/* EXPORT */

export default Observable;
