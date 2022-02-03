
/* IMPORT */

import callable from './callable';
import Context from './context';
import Observable from './observable';
import Observer from './observer';
import {ComputedFunction, ObservableCallableWithoutInitial, ObservableCallable, ObservableOptions} from './types';

/* MAIN */

class Computed<T, TI> extends Observer {

  /* VARIABLES */

  private fn: ComputedFunction<T, TI>;
  private observable: Observable<T | TI>;

  /* CONSTRUCTOR */

  constructor ( fn: ComputedFunction<T, TI>, valueInitial?: T | TI, options?: ObservableOptions<T, T | TI> ) {

    super ();

    this.fn = fn;
    this.observable = new Observable ( valueInitial, options, this ) as Observable<T | TI>; //TSC

    this.update ();

  }

  /* API */

  update (): void {

    Context.registerObserver ( this );

    Observer.unsubscribe ( this );

    delete this.dirty;

    const valuePrev = this.observable.sample ();

    try {

      const valueNext = Context.wrapWith ( () => this.fn ( valuePrev ), this, true );

      this.observable.set ( valueNext );

    } catch ( error: unknown ) {

      this.updateError ( error );

    }

  }

  /* STATIC API */

  static wrap <T> ( fn: ComputedFunction<T, T | undefined> ): ObservableCallableWithoutInitial<T>;
  static wrap <T> ( fn: ComputedFunction<T, T | undefined>, value: undefined, options?: ObservableOptions<T, T | undefined> ): ObservableCallableWithoutInitial<T>;
  static wrap <T> ( fn: ComputedFunction<T, T>, value: T, options?: ObservableOptions<T, T> ): ObservableCallable<T>;
  static wrap <T> ( fn: ComputedFunction<T, T | undefined>, value?: T, options?: ObservableOptions<T, T | undefined> ) {

    return callable ( new Computed ( fn, value, options ).observable );

  }

}

/* EXPORT */

export default Computed;
