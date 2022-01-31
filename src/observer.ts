
/* IMPORT */

import Context from './context';
import Observable from './observable';
import {isArray} from './utils';
import {CleanupFunction} from './types';

/* MAIN */

class Observer {

  /* VARIABLES */

  public dirty?: true; // If dirty it needs updating
  private cleanups?: CleanupFunction[] | CleanupFunction;
  private observables?: Observable[] | Observable;
  private observers?: Observer[] | Observer;

  /* REGISTRATION API */

  registerCleanup ( cleanup: CleanupFunction ): void {

    if ( !this.cleanups ) {

      this.cleanups = cleanup;

    } else if ( isArray ( this.cleanups ) ) {

      this.cleanups.push ( cleanup );

    } else {

      this.cleanups = [this.cleanups, cleanup];

    }

  }

  registerObservable ( observable: Observable ): void {

    if ( !this.observables ) {

      this.observables = observable;

    } else if ( isArray ( this.observables ) ) {

      this.observables.push ( observable );

    } else {

      this.observables = [this.observables, observable];

    }

  }

  registerObserver ( observer: Observer ): void {

    if ( !this.observers ) {

      this.observers = observer;

    } else if ( isArray ( this.observers ) ) {

      this.observers.push ( observer );

    } else {

      this.observers = [this.observers, observer];

    }

  }

  registerSelf (): void {

    if ( !this.observables ) {

      return;

    } else if ( isArray ( this.observables ) ) {

      Context.registerObservables ( this.observables );

    } else {

      Context.registerObservable ( this.observables );

    }

  }

  /* API */

  update (): void {

    delete this.dirty;

  }

  /* STATIC API */

  static unsubscribe ( observer: Observer ): void {

    const {observers, observables, cleanups} = observer;

    if ( observers ) {
      if ( isArray ( observers ) ) {
        for ( let i = 0, l = observers.length; i < l; i++ ) {
          Observer.unsubscribe ( observers[i] );
        }
        observers.length = 0;
      } else {
        Observer.unsubscribe ( observers );
        delete observer.observers;
      }
    }

    if ( observables ) {
      if ( isArray ( observables ) ) {
        for ( let i = 0, l = observables.length; i < l; i++ ) {
          observables[i].unregisterObserver ( observer );
        }
        observables.length = 0;
      } else {
        observables.unregisterObserver ( observer );
        delete observer.observables;
      }
    }

    if ( cleanups ) {
      if ( isArray ( cleanups ) ) {
        for ( let i = 0, l = cleanups.length; i < l; i++ ) {
          cleanups[i]();
        }
        cleanups.length = 0;
      } else {
        cleanups ();
        delete observer.cleanups;
      }
    }

  }

}

/* EXPORT */

export default Observer;
