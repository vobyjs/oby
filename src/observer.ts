
/* IMPORT */

import Observable from './observable';
import Owner from './owner';
import {isArray} from './utils';
import {CleanupFunction, Context, ErrorFunction} from './types';

/* MAIN */

class Observer {

  /* VARIABLES */

  public destroyed?: true; // If destroyed then observables shouldn't notify it anymore
  public dirty?: boolean; // If dirty it needs updating
  protected cleanups?: CleanupFunction[] | CleanupFunction;
  protected context?: Context;
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

  /* API */

  update (): void {

    this.dirty = false;

  }

  updateContext <T> ( symbol: symbol ): T | undefined {

    const {context, parent} = this;

    if ( context && symbol in context ) return context[symbol];

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

    const {observers, observables, cleanups, errors, context} = observer;

    if ( observers ) {
      observer.observers = undefined;
      if ( isArray ( observers ) ) {
        for ( let i = 0, l = observers.length; i < l; i++ ) {
          const observer = observers[i];
          observer.destroyed = true;
          Observer.unsubscribe ( observer );
        }
      } else {
        observers.destroyed = true;
        Observer.unsubscribe ( observers );
      }
    }

    if ( observables ) {
      observer.observables = undefined;
      if ( !observer.destroyed ) {
        if ( isArray ( observables ) ) {
          for ( let i = 0, l = observables.length; i < l; i++ ) {
            observables[i].unregisterObserver ( observer );
          }
        } else {
          observables.unregisterObserver ( observer );
        }
      }
    }

    if ( cleanups ) {
      observer.cleanups = undefined;
      if ( isArray ( cleanups ) ) {
        for ( let i = 0, l = cleanups.length; i < l; i++ ) {
          cleanups[i]();
        }
      } else {
        cleanups ();
      }
    }

    if ( errors ) {
      observer.errors = undefined;
    }

    if ( context ) {
      observer.context = undefined;
    }

  }

}

/* EXPORT */

export default Observer;
