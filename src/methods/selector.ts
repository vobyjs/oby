
/* IMPORT */

import {ROOT} from '~/constants';
import cleanup from '~/methods/cleanup';
import reaction from '~/methods/reaction';
import untrack from '~/methods/untrack';
import {readable} from '~/objects/callable';
import Observable from '~/objects/observable';
import type {SelectorFunction, ObservableReadonly} from '~/types';

/* HELPERS */

class DisposableMap<K, V> extends Map<K, V> { // This allows us to skip emptying the map in some cases, while still being able to signal that it was disposed
  disposed: boolean = false;
}

class SelectedObservable extends Observable<boolean> { // This saves some memory compared to making a dedicated standalone object for metadata + a cleanup function
  count: number = 1;
  selecteds!: DisposableMap<unknown, SelectedObservable>; //TSC
  source?: any;
  /* API */
  call (): void { // Cleanup function
    if ( this.selecteds.disposed ) return;
    this.count -= 1;
    if ( this.count ) return;
    this.dispose ();
    this.selecteds.delete ( this.source );
  }
}

/* MAIN */

const selector = <T> ( source: () => T ): SelectorFunction<T> => {

  /* SIGNAL */

  const signal = ROOT.current;

  /* SELECTEDS */

  let selecteds = new DisposableMap<unknown, SelectedObservable> ();

  let valuePrev: T | undefined;

  reaction ( () => {

    const selectedPrev = selecteds.get ( valuePrev );

    if ( selectedPrev ) selectedPrev.write ( false );

    const valueNext = source ();
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

    selecteds.disposed = true;
    selecteds = new DisposableMap ();

  };

  cleanup ( cleanupAll );

  /* SELECTOR */

  return ( value: T ): ObservableReadonly<boolean> => {

    /* INIT */

    let selected = selecteds.get ( value );

    if ( selected ) {

      selected.count += 1;

    } else {

      selected = new SelectedObservable ( untrack ( source ) === value );
      selected.selecteds = selecteds;
      selected.source = value;
      selected.signal = signal;

      selecteds.set ( value, selected );

    }

    /* CLEANUP */

    cleanup ( selected );

    /* RETURN */

    return readable ( selected );

  };

};

/* EXPORT */

export default selector;
