
/* IMPORT */

import Effect from './effect';
import Observable from './observable';
import Owner from './owner';
import type {SelectorFunction, ObservableAny, PlainObservable} from './types';

/* MAIN */

const selector = <T> ( observable: ObservableAny<T> ): SelectorFunction<T> => {

  /* DISPOSED SELECTOR */

  if ( Observable.target ( observable ).disposed ) { // A disposed observable will never change, no need to make selecteds

    const valueFixed = observable.sample ();

    return ( value: T ): boolean => {

      return value === valueFixed;

    };

  }

  /* SELECTEDS */

  let selecteds: Map<unknown, PlainObservable<boolean, boolean>> = new Map ();

  let valuePrev: T | undefined;

  Effect.create ( () => {

    const selectedPrev = selecteds.get ( valuePrev );

    if ( selectedPrev ) Observable.set ( selectedPrev, false );

    const valueNext = observable ();
    const selectedNext = selecteds.get ( valueNext );

    if ( selectedNext ) Observable.set ( selectedNext, true );

    valuePrev = valueNext;

  });

  /* CLEANUP ALL */

  const cleanupAll = (): void => {

    selecteds.forEach ( selected => {

      Observable.dispose ( selected );

    });

    selecteds = new Map ();

  };

  Owner.registerCleanup ( cleanupAll );

  /* CLENAUP SINGLE */

  const cleanup = function ( this: PlainObservable ): void {

    const observable = this;

    observable['s_count'] -= 1;

    if ( observable['s_count'] ) return;

    if ( !selecteds.size ) return;

    Observable.dispose ( observable );

    selecteds.delete ( observable['s_value'] );

  };

  /* SELECTOR */

  return ( value: T ): boolean => {

    /* INIT */

    let selected: PlainObservable<boolean, boolean>;
    let selectedPrev = selecteds.get ( value );

    if ( selectedPrev ) {

      selected = selectedPrev;
      selected['s_count'] += 1;

    } else {

      selected = Observable.create<boolean, boolean> ( observable.sample () === value );
      selected['s_count'] = 1;
      selected['s_value'] = value;

      selecteds.set ( value, selected );

    }

    /* CLEANUP */

    Owner.registerCleanup ( cleanup.bind ( selected ) );

    /* RETURN */

    return Observable.get ( selected );

  };

};

/* EXPORT */

export default selector;
