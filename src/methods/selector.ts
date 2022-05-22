
/* IMPORT */

import {ROOT} from '~/constants';
import cleanup from '~/methods/cleanup';
import effect from '~/methods/effect';
import sample from '~/methods/sample';
import ObservableClass from '~/objects/observable';
import type {SelectorFunction, Observable, ObservableReadonly} from '~/types';

/* HELPERS */

class SelectedObservable extends ObservableClass<boolean> { // This saves some memory compared to making a dedicated standalone object for metadata
  count: number = 0;
}

/* MAIN */

const selector = <T> ( observable: Observable<T> | ObservableReadonly<T> ): SelectorFunction<T> => {

  /* SIGNAL */

  const signal = ROOT.current.signal;

  /* SELECTEDS */

  let selecteds: Map<unknown, SelectedObservable> = new Map ();

  let valuePrev: T | undefined;

  effect ( () => {

    const selectedPrev = selecteds.get ( valuePrev );

    if ( selectedPrev ) selectedPrev.write ( false );

    const valueNext = observable ();
    const selectedNext = selecteds.get ( valueNext );

    if ( selectedNext ) selectedNext.write ( true );

    valuePrev = valueNext;

  });

  /* CLEANUP ALL */

  const cleanupAll = (): void => {

    if ( !signal.disposed ) {

      selecteds.forEach ( selected => {

        selected.dispose ();

      });

    }

    selecteds = new Map ();

  };

  cleanup ( cleanupAll );

  /* CLENAUP ONE */

  const cleanupOne = function ( this: T ): void {

    const selected = selecteds.get ( this );

    if ( !selected ) return;

    selected.count -= 1;

    if ( selected.count ) return;

    selected.dispose ();

    selecteds.delete ( this );

  };

  /* SELECTOR */

  return ( value: T ): boolean => {

    /* INIT */

    let selected: SelectedObservable;
    let selectedPrev = selecteds.get ( value );

    if ( selectedPrev ) {

      selected = selectedPrev;

    } else {

      selected = new SelectedObservable ( sample ( observable ) === value );

      selecteds.set ( value, selected );

    }

    selected.count += 1;

    /* CLEANUP */

    cleanup ( cleanupOne.bind ( value ) );

    /* RETURN */

    return selected.read ();

  };

};

/* EXPORT */

export default selector;
