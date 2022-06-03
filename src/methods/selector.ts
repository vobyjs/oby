
/* IMPORT */

import {OWNER, ROOT} from '~/constants';
import cleanup from '~/methods/cleanup';
import reaction from '~/methods/reaction';
import sample from '~/methods/sample';
import {readable} from '~/objects/callable';
import ObservableClass from '~/objects/observable';
import type {SelectorFunction, Observable, ObservableReadonly} from '~/types';

/* HELPERS */

class SelectedObservable extends ObservableClass<boolean> { // This saves some memory compared to making a dedicated standalone object for metadata
  count: number = 0;
  readable?: ObservableReadonly<boolean>;
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

  function selector ( value: T, options?: { observable?: false } ): boolean;
  function selector ( value: T, options: { observable: true } ): ObservableReadonly<boolean>;
  function selector ( value: T, options?: { observable?: boolean } ): boolean | ObservableReadonly<boolean> {

    /* INIT */

    let selected: SelectedObservable;
    let selectedPrev = selecteds.get ( value );

    if ( selectedPrev ) {

      selected = selectedPrev;

    } else {

      selected = new SelectedObservable ( sample ( observable ) === value );
      selected.signal = signal;

      selecteds.set ( value, selected );

    }

    selected.count += 1;

    /* CLEANUP */

    cleanup ( cleanupOne.bind ( value ) );

    /* RETURN */

    if ( options?.observable ) return selected.readable || ( selected.readable = readable ( selected ) ); //TODO: Cache readables at the "readable" function level isntead, or somewhere else deeper than this

    return selected.read ();

  };

  return selector;

};

/* EXPORT */

export default selector;
