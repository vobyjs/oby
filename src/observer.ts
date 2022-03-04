
/* IMPORT */

import Observable from './observable';
import Owner from './owner';
import {isArray, isSet} from './utils';
import {CleanupFunction, Contexts, ErrorFunction} from './types';

/* MAIN */

class Observer {

  /* VARIABLES */

  public dirty?: true; // If dirty it needs updating
  protected cleanups?: CleanupFunction[] | CleanupFunction;
  protected contexts?: Contexts;
  protected errors?: ErrorFunction[] | ErrorFunction;
  protected observables?: Observable[] | Observable;
  protected observers?: Set<Observer> | Observer;
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

  registerContext <T> ( symbol: symbol, value: T ): T {

    if ( !this.contexts ) this.contexts = {};

    this.contexts[symbol] = value;

    return value;

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

    } else if ( isSet ( this.observers ) ) {

      this.observers.add ( observer );

    } else {

      const observerPrev = this.observers;

      this.observers = new Set ();

      this.observers.add ( observerPrev );
      this.observers.add ( observer );

    }

  }

  registerParent ( observer: Observer ): void {

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

    } else if ( isSet ( this.observers ) ) {

      this.observers.delete ( observer )

    } else {

      if ( this.observers === observer ) {

        delete this.observers;

      }

    }

  }

  unregisterParent (): void {

    delete this.parent;

  }

  /* API */

  update (): void {

    delete this.dirty;

  }

  updateContext <T> ( symbol: symbol ): T | undefined {

    const {contexts, parent} = this;

    if ( contexts && symbol in contexts ) return contexts[symbol];

    if ( !parent ) return;

    return parent.updateContext ( symbol );

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

    const {observers, observables, cleanups, errors, contexts} = observer;

    if ( observers ) {
      if ( isSet ( observers ) ) {
        for ( const observer of observers ) {
          Observer.unsubscribe ( observer );
        }
        observers.clear ();
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

    if ( contexts ) {
      delete observer.contexts;
    }

  }

}

/* EXPORT */

export default Observer;
