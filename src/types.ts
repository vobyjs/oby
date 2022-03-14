
/* MAIN */

type BatchFunction = () => void;

type CleanupFunction = () => void;

type ComparatorFunction<T = unknown, TI = unknown> = ( value: T, valuePrev: T | TI ) => boolean;

type ComputedFunction<T = unknown, TI = unknown> = ( valuePrev: T | TI ) => T;

type Context = Record<symbol, any>;

type DisposeFunction = () => void;

type EffectFunction = () => CleanupFunction | void;

type ErrorFunction = ( error: unknown ) => void;

type FromFunction<T = unknown> = ( observable: ObservableWithoutInitial<T> ) => CleanupFunction | void;

type OwnerFunction<T = unknown> = ( dispose: DisposeFunction ) => T;

type ProduceFunction<T = unknown> = ( value: T ) => T | undefined;

type SelectFunction<T = unknown, R = unknown> = ( value: T ) => R;

type SelectorFunction<T = unknown> = ( value: T ) => boolean;

type UpdateFunction<T = unknown> = ( value: T ) => T;

type ObservableAbstract<T = unknown, TI = unknown> = {
  (): T | TI,
  ( value: T ): T,
  get (): T | TI,
  sample (): T | TI,
  select <R> ( fn: ( value: T | TI ) => R, options?: ObservableOptions<R, R> ): ObservableReadonly<R>,
  set ( value: T ): T,
  produce ( fn: ( value: T | TI ) => T | undefined ): T,
  update ( fn: ( value: T | TI ) => T ): T,
  emit (): void,
  readonly (): ObservableReadonlyAbstract<T, TI>,
  isReadonly (): false
};

type ObservableWithoutInitial<T = unknown> = ObservableAbstract<T, T | undefined>;

type Observable<T = unknown> = ObservableAbstract<T, T>;

type ObservableReadonlyAbstract<T = unknown, TI = unknown> = {
  (): T | TI,
  get (): T | TI,
  sample (): T | TI,
  select <R> ( fn: ( value: T | TI ) => R, options?: ObservableOptions<R, R> ): ObservableReadonly<R>,
  emit (): void,
  readonly (): ObservableReadonlyAbstract<T, TI>,
  isReadonly (): true
};

type ObservableReadonlyWithoutInitial<T = unknown> = ObservableReadonlyAbstract<T, T | undefined>;

type ObservableReadonly<T = unknown> = ObservableReadonlyAbstract<T, T>;

type ObservableAny<T = unknown> = ObservableWithoutInitial<T> | Observable<T> | ObservableReadonlyWithoutInitial<T> | ObservableReadonly<T>;

type ObservableOptions<T = unknown, TI = unknown> = {
  comparator?: ComparatorFunction<T, TI>
};

type ObservableResolved<T = unknown> = T extends ObservableAny<infer U> ? U : T;

/* EXPORT */

export {BatchFunction, CleanupFunction, ComparatorFunction, ComputedFunction, Context, DisposeFunction, EffectFunction, ErrorFunction, FromFunction, OwnerFunction, ProduceFunction, SelectFunction, SelectorFunction, UpdateFunction, ObservableAbstract, ObservableWithoutInitial, Observable, ObservableReadonlyAbstract, ObservableReadonlyWithoutInitial, ObservableReadonly, ObservableAny, ObservableOptions, ObservableResolved};
