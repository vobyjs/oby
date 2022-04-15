
/* IMPORT */

import {readable} from './callable';
import Observable from './observable';
import Observer from './observer';
import Owner from './owner';
import {ComputedFunction, ObservableReadonly, ObservableOptions} from './types';

/* MAIN */

//TODO: Find out why disposing automatically of the observable doesn't improve performance here

class Computed<T = unknown, TI = unknown> extends Observer {

  /* VARIABLES */

  private fn: ComputedFunction<T, TI>;
  private observable: Observable<T | TI>;

  /* CONSTRUCTOR */

  constructor ( fn: ComputedFunction<T, TI>, valueInitial?: T | TI, options?: ObservableOptions<T, T | TI> ) {

    super ();

    this.fn = fn;
    this.observable = new Observable ( valueInitial, options, this ) as Observable<T | TI>; //TSC

    Owner.registerObserver ( this );

    this.update ( true );

  }

  /* API */

  onStale ( fresh: boolean ): void {

    super.onStale ( fresh );

    if ( this.staleCount === 1 ) {

      this.observable.emitStale ( fresh );

    }

  }

  update ( fresh: boolean ): void {

    if ( fresh ) { // The resulting value might change

      if ( this.dirty !== undefined ) { // Skipping unusbscription during the first execution

        this.dispose ();

      }

      this.dirty = false;

      const valuePrev = this.observable.value;

      try {

        const valueNext: T = Owner.wrapWith ( this.fn.bind ( undefined, valuePrev ), this );

        this.observable.set ( valueNext );

      } catch ( error: unknown ) {

        this.updateError ( error );

      }

    } else { // The resulting value could/should not possibly change

      this.observable.emitUnstale ( false );

    }

  }

  /* STATIC API */

  static wrap <T> ( fn: ComputedFunction<T, T | undefined> ): ObservableReadonly<T>;
  static wrap <T> ( fn: ComputedFunction<T, T | undefined>, value: undefined, options?: ObservableOptions<T, T | undefined> ): ObservableReadonly<T>;
  static wrap <T> ( fn: ComputedFunction<T, T>, value: T, options?: ObservableOptions<T, T> ): ObservableReadonly<T>;
  static wrap <T> ( fn: ComputedFunction<T, T | undefined>, value?: T, options?: ObservableOptions<T, T | undefined> ) {

    return readable ( new Computed ( fn, value, options ).observable );

  }

}

/* EXPORT */

export default Computed;
