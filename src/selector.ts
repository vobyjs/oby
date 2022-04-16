
/* IMPORT */

import Effect from './effect';
import Observable from './observable';
import Owner from './owner';
import type {SelectorFunction, ObservableAny, PlainObservable} from './types';

/* MAIN */

const selector = <T> ( observable: ObservableAny<T> ): SelectorFunction<T> => {

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

    observable.listeners -= 1;

    if ( observable.listeners ) return;

    Observable.dispose ( observable );

    if ( !selecteds.size ) return;

    selecteds.delete ( observable.listenedValue );

  };

  /* SELECTOR */

  const selector = ( value: T ): boolean => {

    /* INIT */

    let selected: PlainObservable<boolean, boolean>;
    const selectedPrev = selecteds.get ( value );

    if ( selectedPrev ) {

      selected = selectedPrev;
      selected.listeners += 1;

    } else {

      selected = Observable.create<boolean, boolean> ( observable.sample () === value );
      selected.listeners = 1;
      selected.listenedValue = value;

      selecteds.set ( value, selected );

    }

    /* CLEANUP */

    Owner.registerCleanup ( cleanup.bind ( selected ) );

    /* RETURN */

    return Observable.get ( selected );

  };

  selector.dispose = cleanupAll;

  return selector;

};

/* EXPORT */

export default selector;
