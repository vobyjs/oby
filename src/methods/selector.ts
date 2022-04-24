
/* IMPORT */

import cleanup from '~/methods/cleanup';
import effect from '~/methods/effect';
import Observable from '~/objects/observable';
import type {SelectorFunction, ObservableAny, Selected} from '~/types';

/* MAIN */

const selector = <T> ( observable: ObservableAny<T> ): SelectorFunction<T> => {

  /* SELECTEDS */

  let selecteds: Map<unknown, Selected> = new Map ();

  let valuePrev: T | undefined;

  effect ( () => {

    const selectedPrev = selecteds.get ( valuePrev );

    if ( selectedPrev ) selectedPrev.observable.set ( false );

    const valueNext = observable ();
    const selectedNext = selecteds.get ( valueNext );

    if ( selectedNext ) selectedNext.observable.set ( true );

    valuePrev = valueNext;

  });

  /* CLEANUP ALL */

  const cleanupAll = (): void => {

    selecteds.forEach ( selected => {

      selected.observable.dispose ();

    });

    selecteds = new Map ();

  };

  cleanup ( cleanupAll );

  /* CLENAUP ONE */

  const cleanupOne = function ( this: Selected ): void {

    const selected = this;

    selected.count -= 1;

    if ( selected.count ) return;

    if ( !selecteds.size ) return;

    selected.observable.dispose ();

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

      const o = new Observable<boolean, boolean> ( observable.sample () === value );

      selected = { count: 1, value, observable: o };

      selecteds.set ( value, selected );

    }

    /* CLEANUP */

    cleanup ( cleanupOne.bind ( selected ) );

    /* RETURN */

    return selected.observable.get ();

  };

};

/* EXPORT */

export default selector;
