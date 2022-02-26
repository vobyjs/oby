
/* MAIN */

type BatchFunction = () => void;

type CleanupFunction = () => void;

type ComparatorFunction<T = unknown, TI = unknown> = ( value: T, valuePrev: T | TI ) => boolean;

type ComputedFunction<T = unknown, TI = unknown> = ( valuePrev: T | TI ) => T;

type ContextFunction<T = unknown> = ( dispose: DisposeFunction ) => T;

type DisposeFunction = () => void;

type EffectFunction = () => CleanupFunction | void;

type ErrorFunction = ( error: unknown ) => void;

type FromFunction<T = unknown> = ( observable: ObservableCallableWithoutInitial<T> ) => CleanupFunction | void;

type ProduceFunction<T> = ( value: T ) => T | void;

type UpdateFunction<T> = ( value: T ) => T;

type ObservableCallableAbstract<T = unknown, TI = unknown> = {
  (): T | TI,
  ( value: T ): T,
  get (): T | TI,
  sample (): T | TI,
  set ( value: T ): T,
  produce ( fn: ( value: T | TI ) => T | void ): T,
  update ( fn: ( value: T | TI ) => T ): T,
  on <U> ( fn: ( value: T ) => U, dependencies?: ObservableAny[] ): ReadonlyObservableCallable<U>,
  on <U> ( fn: ( value: T ) => U, options?: ObservableOptions<U, U | undefined>, dependencies?: ObservableAny[] ): ReadonlyObservableCallable<U>
};

type ObservableCallableWithoutInitial<T = unknown> = ObservableCallableAbstract<T, T | undefined>;

type ObservableCallable<T = unknown> = ObservableCallableAbstract<T, T>;

type ReadonlyObservableCallableAbstract<T = unknown, TI = unknown> = {
  (): T | TI,
  get (): T | TI,
  sample (): T | TI,
  on <U> ( fn: ( value: T ) => U, dependencies?: ObservableAny[] ): ReadonlyObservableCallable<U>,
  on <U> ( fn: ( value: T ) => U, options?: ObservableOptions<U, U | undefined>, dependencies?: ObservableAny[] ): ReadonlyObservableCallable<U>
};

type ReadonlyObservableCallableWithoutInitial<T = unknown> = ReadonlyObservableCallableAbstract<T, T | undefined>;

type ReadonlyObservableCallable<T = unknown> = ReadonlyObservableCallableAbstract<T, T>;

type ObservableAny<T = unknown> = ObservableCallableWithoutInitial<T> | ObservableCallable<T> | ReadonlyObservableCallableWithoutInitial<T> | ReadonlyObservableCallable<T>;

type ObservableResolver<T = unknown> = { (): ObservableResolver<T>, get (): ObservableResolver<T>, sample (): ObservableResolver<T> } | ObservableAny<T>;

type ObservableResolved<T = unknown> = T extends ObservableResolver<infer Value> ? ObservableResolved<Value> : T;

type ObservableOptions<T = unknown, TI = unknown> = {
  comparator?: ComparatorFunction<T, TI>
};

/* EXPORT */

export {BatchFunction, CleanupFunction, ComparatorFunction, ComputedFunction, ContextFunction, DisposeFunction, EffectFunction, ErrorFunction, FromFunction, ProduceFunction, UpdateFunction, ObservableCallableAbstract, ObservableCallableWithoutInitial, ObservableCallable, ReadonlyObservableCallableAbstract, ReadonlyObservableCallableWithoutInitial, ReadonlyObservableCallable, ObservableAny, ObservableResolver, ObservableResolved, ObservableOptions};
