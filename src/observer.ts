
/* IMPORT */

import Owner from './owner';
import Observable from './observable';
import {isArray} from './utils';
import {CleanupFunction, ErrorFunction} from './types';

/* MAIN */

class Observer {

  /* VARIABLES */

  public dirty?: true; // If dirty it needs updating
  protected cleanups?: CleanupFunction[] | CleanupFunction;
  protected errors?: ErrorFunction[] | ErrorFunction;
  protected observables?: Observable[] | Observable;
  protected observers?: Observer[] | Observer;
  private parent?: Observer;

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

  registerError ( error: ErrorFunction ): void {

    if ( !this.errors ) {

      this.errors = error;

    } else if ( isArray ( this.errors ) ) {

      this.errors.push ( error );

    } else {

      this.errors = [this.errors, error];

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

  registerParent ( observer: Observer ): void  {

    this.parent = observer;

  }

  registerSelf (): void {

    if ( !this.observables ) {

      return;

    } else if ( isArray ( this.observables ) ) {

      Owner.registerObservables ( this.observables );

    } else {

      Owner.registerObservable ( this.observables );

    }

  }

  unregisterObserver ( observer: Observer ): void {

    if ( !this.observers ) {

      return;

    } else if ( isArray ( this.observers ) ) {

      const index = this.observers.indexOf ( observer ); //TODO: This could be a performance issue, depending on how large this array grows

      if ( index >= 0 ) {

        this.observers.splice ( index, 1 );

      }

    } else {

      if ( this.observers === observer ) {

        delete this.observers;

      }

    }

  }

  unregisterParent (): void  {

    delete this.parent;

  }

  /* API */

  update (): void {

    delete this.dirty;

  }

  updateError ( error: unknown, silent?: boolean ): boolean {

    const {errors, parent} = this;

    if ( errors ) {

      if ( isArray ( errors ) ) {

        errors.forEach ( fn => fn ( error ) );

      } else {

        errors ( error );

      }

      return true;

    } else {

      if ( parent ) {

        if ( parent.updateError ( error, true ) ) return true;

      }

      if ( !silent ) {

        throw error;

      }

      return false;

    }

  }

  /* STATIC API */

  static unsubscribe ( observer: Observer ): void {

    const {observers, observables, cleanups, errors} = observer;

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

    if ( errors ) {
      if ( isArray ( errors ) ) {
        errors.length = 0;
      } else {
        delete observer.errors;
      }
    }

  }

}

/* EXPORT */

export default Observer;
