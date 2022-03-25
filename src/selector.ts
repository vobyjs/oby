
/* IMPORT */

import Effect from './effect';
import Observable from './observable';
import Owner from './owner';
import {SelectorFunction, ObservableAny} from './types';

/* MAIN */

const selector = <T> ( observable: ObservableAny<T> ): SelectorFunction<T> => {

  /* SELECTEDS */

  const selecteds: Map<T | undefined, Observable<boolean>> = new Map ();

  let valuePrev: T | undefined;

  new Effect ( () => {

    const selectedPrev = selecteds.get ( valuePrev );

    if ( selectedPrev ) selectedPrev.set ( false );

    const valueNext = observable ();
    const selectedNext = selecteds.get ( valueNext );

    if ( selectedNext ) selectedNext.set ( true );

    valuePrev = valueNext;

  });

  /* SELECTOR */

  return ( value: T ): boolean => {

    /* INIT */

    let selected: Observable<boolean>;
    const selectedPrev = selecteds.get ( value );

    if ( selectedPrev ) {

      selected = selectedPrev;
      selected['listeners'] += 1;

    } else {

      selected = new Observable ( observable.sample () === value );
      selected['listeners'] = 1;

      selecteds.set ( value, selected );

    }

    /* CLEANUP */

    Owner.registerCleanup ( () => {

      selected['listeners'] -= 1;

      if ( selected['listeners'] ) return;

      selecteds.delete ( value );

    });

    /* RETURN */

    return selected.get ();

  };

};

/* EXPORT */

export default selector;
