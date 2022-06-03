
/* IMPORT */

import {OWNER, ROOT} from '~/constants';
import cleanup from '~/methods/cleanup';
import reaction from '~/methods/reaction';
import sample from '~/methods/sample';
import {readable} from '~/objects/callable';
import ObservableClass from '~/objects/observable';
import type {SelectorFunction, Observable, ObservableReadonly} from '~/types';

/* HELPERS */

class SelectedObservable extends ObservableClass<boolean> { // This saves some memory compared to making a dedicated standalone object for metadata + a cleanup function
  count: number = 0;
  selecteds?: Map<unknown, SelectedObservable>;
  source?: any;
  /* API */
  call (): void { // Cleanup function
    if ( !this.selecteds!.size ) return; //TSC
    this.count -= 1;
    if ( this.count ) return;
    this.dispose ();
    this.selecteds!.delete ( this.source ); //TSC
  }
}

/* MAIN */

const selector = <T> ( observable: Observable<T> | ObservableReadonly<T> ): SelectorFunction<T> => {

  /* SIGNAL */

  const signal = OWNER.current.signal || ROOT.current;

  /* SELECTEDS */

  let selecteds: Map<unknown, SelectedObservable> = new Map ();

  let valuePrev: T | undefined;

  reaction ( () => {

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

  /* SELECTOR */

  return ( value: T ): ObservableReadonly<boolean> => {

    /* INIT */

    let selected: SelectedObservable;
    let selectedPrev = selecteds.get ( value );

    if ( selectedPrev ) {

      selected = selectedPrev;

    } else {

      selected = new SelectedObservable ( sample ( observable ) === value );
      selected.selecteds = selecteds;
      selected.source = value;
      selected.signal = signal;

      selecteds.set ( value, selected );

    }

    selected.count += 1;

    /* CLEANUP */

    cleanup ( selected );

    /* RETURN */

    return readable ( selected );

  };

};

/* EXPORT */

export default selector;
