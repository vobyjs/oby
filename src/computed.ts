
/* IMPORT */

import {readable} from './callable';
import Observable from './observable';
import Observer from './observer';
import Owner from './owner';
import type {ComputedFunction, ObservableOptions, PlainComputed} from './types';

/* MAIN */

//TODO: Find out why disposing automatically of the observable doesn't improve performance here

const Computed = {

  /* WRAPPING API */

  // wrap <T> ( fn: ComputedFunction<T, T | undefined> ): ObservableReadonly<T>;
  // wrap <T> ( fn: ComputedFunction<T, T | undefined>, value: undefined, options?: ObservableOptions<T, T | undefined> ): ObservableReadonly<T>;
  // wrap <T> ( fn: ComputedFunction<T, T>, value: T, options?: ObservableOptions<T, T> ): ObservableReadonly<T>;
  wrap <T> ( fn: ComputedFunction<T, T | undefined>, value?: T, options?: ObservableOptions<T, T | undefined> ) { //FIXME: Overload missing

    return readable ( Computed.create ( fn, value, options ).observable );

  },

  /* API */

  create: <T> ( fn: ComputedFunction<T, T | undefined>, valueInitial?: T, options?: ObservableOptions<T, T | undefined> ): PlainComputed<T, T | undefined> => {

    const computed: PlainComputed<T, T | undefined> = {
      symbol: 3,
      staleCount: 0,
      staleFresh: false,
      cleanups: [],
      context: {},
      errors: [],
      observables: [],
      observers: [],
      parent: Owner.get (),
      fn,
      observable: Observable.create<T, T | undefined> ( valueInitial as any, options ) //TODO
    };

    computed.observable.parent = computed;

    Owner.registerObserver ( computed );

    Computed.update ( computed, true );

    return computed;

  },

  onStale: ( computed: PlainComputed, fresh: boolean ): void => {

    Observer.onStale ( computed, fresh );

    if ( computed.staleCount === 1 ) {

      Observable.emitStale ( computed.observable, fresh );

    }

  },

  update: <T> ( computed: PlainComputed, fresh: boolean ): void => {

    if ( fresh ) { // The resulting value might change

      Observer.dispose ( computed );

      const valuePrev = computed.observable.value;

      try {

        const valueNext: T = Owner.wrapWith ( computed.fn.bind ( undefined, valuePrev ), computed );

        Observable.set ( computed.observable, valueNext );

      } catch ( error: unknown ) {

        Observer.updateError ( computed, error );

        Observable.emitUnstale ( computed.observable, fresh );

      }

    } else { // The resulting value could/should not possibly change

      Observable.emitUnstale ( computed.observable, false );

    }

  }

};

/* EXPORT */

export default Computed;
