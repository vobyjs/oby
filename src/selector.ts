
/* IMPORT */

import Effect from './effect';
import Observable from './observable';
import Owner from './owner';
import type {SelectorFunction, ObservableAny, Selected} from './types';

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

  let selecteds: Map<unknown, Selected> = new Map ();

  let valuePrev: T | undefined;

  Effect.create ( () => {

    const selectedPrev = selecteds.get ( valuePrev );

    if ( selectedPrev ) Observable.set ( selectedPrev.observable, false );

    const valueNext = observable ();
    const selectedNext = selecteds.get ( valueNext );

    if ( selectedNext ) Observable.set ( selectedNext.observable, true );

    valuePrev = valueNext;

  });

  /* CLEANUP ALL */

  const cleanupAll = (): void => {

    selecteds.forEach ( selected => {

      Observable.dispose ( selected.observable );

    });

    selecteds = new Map ();

  };

  Owner.registerCleanup ( cleanupAll );

  /* CLENAUP SINGLE */

  const cleanup = function ( this: Selected ): void {

    const selected = this;

    selected.count -= 1;

    if ( selected.count ) return;

    if ( !selecteds.size ) return;

    Observable.dispose ( selected.observable );

    selecteds.delete ( selected.value );

  };

  /* SELECTOR */

  return ( value: T ): boolean => {

    /* INIT */

    let selected: Selected;
    let selectedPrev = selecteds.get ( value );

    if ( selectedPrev ) {

      selected = selectedPrev;
      selected.count += 1;

    } else {

      const o = Observable.create<boolean, boolean> ( observable.sample () === value );

      selected = { count: 1, value, observable: o };

      selecteds.set ( value, selected );

    }

    /* CLEANUP */

    Owner.registerCleanup ( cleanup.bind ( selected ) );

    /* RETURN */

    return Observable.get ( selected.observable );

  };

};

/* EXPORT */

export default selector;
