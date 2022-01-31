
/* MAIN */

type BatchFunction = () => void;

type CleanupFunction = () => void;

type ComparatorFunction<T = unknown, TI = unknown> = ( value: T, valuePrev: T | TI ) => boolean;

type ComputedFunction<T = unknown, TI = unknown> = ( valuePrev: T | TI ) => T;

type ContextFunction<T = unknown> = ( dispose: DisposeFunction ) => T;

type DisposeFunction = () => void;

type EffectFunction = () => CleanupFunction | void;

type FromFunction<T = unknown> = ( observable: ObservableCallableWithoutInitial<T> ) => CleanupFunction | void;

type UpdateFunction<T> = ( value: T ) => T | void;

type ObservableCallableAbstract<T = unknown, TI = unknown> = {
  (): T | TI,
  ( value: T ): T,
  get (): T | TI,
  sample (): T | TI,
  set ( value: T ): T,
  update ( fn: ( value: T | TI ) => T | void ): T,
  on <U> ( fn: ( value: T ) => U, dependencies?: (ObservableCallableWithoutInitial | ObservableCallable)[] ): ObservableCallable<U>,
  on <U> ( fn: ( value: T ) => U, options?: ObservableOptions<U, U | undefined>, dependencies?: (ObservableCallableWithoutInitial | ObservableCallable)[] ): ObservableCallable<U>
};

type ObservableCallableWithoutInitial<T = unknown> = ObservableCallableAbstract<T, T | undefined>;

type ObservableCallable<T = unknown> = ObservableCallableAbstract<T, T>;

type ObservableOptions<T = unknown, TI = unknown> = {
  comparator?: ComparatorFunction<T, TI>
};

/* EXPORT */

export {BatchFunction, CleanupFunction, ComparatorFunction, ComputedFunction, ContextFunction, DisposeFunction, EffectFunction, FromFunction, UpdateFunction, ObservableCallableAbstract, ObservableCallableWithoutInitial, ObservableCallable, ObservableOptions};
