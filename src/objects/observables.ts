
/* IMPORT */

import type {IObservable, IObserver} from '~/types';

/* MAIN */

// Dedicated data structures for managing observables efficiently
// We use an array if the list is small enough, as that's faster than a Set, and only switch to Sets after that

class ObservablesArray {

  /* VARIABLES */

  observer: IObserver;
  observables: IObservable[];
  observablesIndex: number;

  /* CONSTRUCTOR */

  constructor ( observer: IObserver ) {

    this.observer = observer;
    this.observables = [];
    this.observablesIndex = 0;

  }

  /* API */

  dispose ( deep: boolean ): void {

    if ( deep ) {

      const {observer, observables} = this;

      for ( let i = 0; i < observables.length; i++ ) {

        observables[i].observers.delete ( observer );

      }

    }

    this.observablesIndex = 0;

  }

  postdispose (): void {

    const {observer, observables, observablesIndex} = this;
    const observablesLength = observables.length;

    if ( observablesIndex < observablesLength ) {

      for ( let i = observablesIndex; i < observablesLength; i++ ) {

        observables[i].observers.delete ( observer );

      }

      observables.length = observablesIndex;

    }

  }

  empty (): boolean {

    return !this.observables.length;

  }

  has ( observable: IObservable<any> ): boolean {

    const index = this.observables.indexOf ( observable );

    return index >= 0 && index < this.observablesIndex;

  }

  link ( observable: IObservable<any> ): void {

    const {observer, observables, observablesIndex} = this;
    const observablesLength = observables.length;

    if ( observablesLength > 0 ) {

      if ( observables[observablesIndex] === observable ) {

        this.observablesIndex += 1;

        return;

      }

      const index = observables.indexOf ( observable );

      if ( index >= 0 && index < observablesIndex ) {

        return;

      }

      if ( observablesIndex < observablesLength - 1 ) {

        this.postdispose ();

      } else if ( observablesIndex === observablesLength - 1 ) {

        observables[observablesIndex].observers.delete ( observer );

      }

    }

    observable.observers.add ( observer );

    observables[this.observablesIndex++] = observable;

    if ( observablesIndex === 128 ) { // Switching to a Set, as indexOf checks may get artbirarily expensive otherwise

      observer.observables = new ObservablesSet ( observer, observables );

    }

  }

  update (): void {

    const {observables} = this;

    for ( let i = 0, l = observables.length; i < l; i++ ) {

      observables[i].parent?.update ();

    }

  }

}

class ObservablesSet {

  /* VARIABLES */

  observer: IObserver;
  observables: Set<IObservable>;

  /* CONSTRUCTOR */

  constructor ( observer: IObserver, observables: IObservable[] ) {

    this.observer = observer;
    this.observables = new Set ( observables );

  }

  /* API */

  dispose ( deep: boolean ): void {

    for ( const observable of this.observables ) {

      observable.observers.delete ( this.observer );

    }

  }

  postdispose (): void {

    return;

  }

  empty (): boolean {

    return !this.observables.size;

  }

  has ( observable: IObservable ): boolean {

    return this.observables.has ( observable );

  }

  link ( observable: IObservable<any> ): void {

    const {observer, observables} = this;
    const sizePrev = observables.size;

    observable.observers.add ( observer );

    const sizeNext = observables.size;

    if ( sizePrev === sizeNext ) return; // Cheaper than Set.has+Set.add

    observables.add ( observable );

  }

  update (): void {

    for ( const observable of this.observables ) {

      observable.parent?.update ();

    }

  }

}

/* EXPORT */

export {ObservablesArray, ObservablesSet};
