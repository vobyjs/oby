
/* IMPORT */

import Effect from './effect';
import Observable from './observable';
import Owner from './owner';
import {SelectorFunction, ObservableAny} from './types';

/* MAIN */

const selector = <T> ( observable: ObservableAny<T> ): SelectorFunction<T> => {

  /* SELECTEDS */

  let selecteds: Map<T | undefined, Observable<boolean>> = new Map ();

  let valuePrev: T | undefined;

  new Effect ( () => {

    const selectedPrev = selecteds.get ( valuePrev );

    if ( selectedPrev ) selectedPrev.set ( false );

    const valueNext = observable ();
    const selectedNext = selecteds.get ( valueNext );

    if ( selectedNext ) selectedNext.set ( true );

    valuePrev = valueNext;

  });

  /* BULK CLEANUP */

  Owner.registerCleanup ( () => {

    selecteds = new Map ();

  });

  /* SINGLE CLENAUP */

  const cleanup = function ( this: Observable ): void {

    this.listeners -= 1;

    if ( this.listeners ) return;

    this.dispose ();

    if ( !selecteds.size ) return;

    selecteds.delete ( this.listenedValue );

  };

  /* SELECTOR */

  return ( value: T ): boolean => {

    /* INIT */

    let selected: Observable<boolean>;
    const selectedPrev = selecteds.get ( value );

    if ( selectedPrev ) {

      selected = selectedPrev;
      selected.listeners += 1;

    } else {

      selected = new Observable ( observable.sample () === value );
      selected.listeners = 1;
      selected.listenedValue = value;

      selecteds.set ( value, selected );

    }

    /* CLEANUP */

    Owner.registerCleanup ( cleanup.bind ( selected ) );

    /* RETURN */

    return selected.get ();

  };

};

/* EXPORT */

export default selector;
