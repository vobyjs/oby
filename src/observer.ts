
/* IMPORT */

import Observable from './observable';
import Owner from './owner';
import {isArray} from './utils';
import {CleanupFunction, Context, ErrorFunction} from './types';

/* MAIN */

class Observer {

  /* VARIABLES */

  public dirty?: boolean; // If dirty it needs updating
  protected cleanups?: CleanupFunction[] | CleanupFunction;
  protected context?: Context;
  protected errors?: ErrorFunction[] | ErrorFunction;
  protected observables?: Observable[] | Observable;
  protected observers?: Observer[] | Observer;
  private parent?: Observer = Owner.get ();

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

    if ( !this.context ) this.context = {};

    this.context[symbol] = value;

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

    } else if ( isArray ( this.observers ) ) {

      this.observers.push ( observer );

    } else {

      this.observers = [this.observers, observer];

    }

  }

  registerSelf (): void {

    const {observables} = this;

    if ( !observables ) {

      return;

    } else if ( isArray ( observables ) ) {

      Owner.registerObservables ( observables );

    } else {

      Owner.registerObservable ( observables );

    }

  }

  unregisterObserver ( observer: Observer ): void {

    if ( !this.observers ) {

      return;

    } else if ( isArray ( this.observers ) ) {

      if ( this.observers.length < 3 ) { //TODO: Otherwise it may be expensive, and unregistering an observer is not stricly necessary, though this is kind of ugly

        const first = this.observers[0];
        const second = this.observers[1];

        if ( first === observer ) {

          this.observers = second;

        } else if ( second === observer ) {

          this.observers = first;

        }

      }

    } else if ( this.observers === observer ) {

      this.observers = undefined;

    }

  }

  /* API */

  update (): void {}

  updateContext <T> ( symbol: symbol ): T | undefined {

    const {context, parent} = this;

    if ( context && symbol in context ) return context[symbol];

    return parent?.updateContext ( symbol );

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

  dispose (): void {

    const {observers, observables, cleanups, errors, context} = this;

    if ( observers ) {
      this.observers = undefined;
      if ( isArray ( observers ) ) {
        for ( let i = 0, l = observers.length; i < l; i++ ) {
          observers[i].dispose ();
        }
      } else {
        observers.dispose ();
      }
    }

    if ( observables ) {
      this.observables = undefined;
      if ( isArray ( observables ) ) {
        for ( let i = 0, l = observables.length; i < l; i++ ) {
          const observable = observables[i];
          if ( !observable.disposed ) {
            observable.unregisterObserver ( this );
          }
        }
      } else {
        if ( !observables.disposed ) {
          observables.unregisterObserver ( this );
        }
      }
    }

    if ( cleanups ) {
      this.cleanups = undefined;
      if ( isArray ( cleanups ) ) {
        for ( let i = 0, l = cleanups.length; i < l; i++ ) {
          cleanups[i]();
        }
      } else {
        cleanups ();
      }
    }

    if ( errors ) {
      this.errors = undefined;
    }

    if ( context ) {
      this.context = undefined;
    }

  }

}

/* EXPORT */

export default Observer;
