
/* FUNCTIONS */

type BatchFunction = () => void;

type CleanupFunction = () => void;

type ComparatorFunction<T = unknown, TI = unknown> = ( value: T, valuePrev: T | TI ) => boolean;

type ComputedFunction<T = unknown, TI = unknown> = ( valuePrev: T | TI ) => T;

type DisposeFunction = () => void;

type EffectFunction = () => CleanupFunction | void;

type ErrorFunction = ( error: unknown ) => void;

type FromFunction<T = unknown> = ( observable: ObservableWithoutInitial<T> ) => CleanupFunction | void;

type OwnerFunction<T = unknown> = ( dispose: DisposeFunction ) => T;

type ProduceFunction<T = unknown, R = unknown> = ( value: T ) => R | undefined;

type SelectFunction<T = unknown, R = unknown> = ( value: T ) => R;

type SelectorFunction<T = unknown> = (( value: T ) => boolean) & { dispose: CleanupFunction };

type UpdateFunction<T = unknown, R = unknown> = ( value: T ) => R;

/* PLAIN OBJECTS */ //TODO: Clean this up massively, and improve memory usage

type PlainObservable<T = unknown, TI = unknown> = {
  symbol: 1,
  disposed: boolean,
  value: T | TI,
  listeners: number,
  listenedValue: unknown,
  comparator: ComparatorFunction<T, TI>,
  computeds: Set<PlainObserver>,
  effects: Set<PlainObserver>,
  parent?: PlainObserver
};

type PlainObserverBase = {
  staleCount: number,
  staleFresh: boolean,
  cleanups: CleanupFunction[],
  context: Record<symbol, any>,
  errors: ErrorFunction[],
  observables: PlainObservable[],
  observers: PlainObserver[]
};

type PlainComputed<T = unknown, TI = unknown> = PlainObserverBase & {
  symbol: 3,
  fn: ComputedFunction<T, TI>,
  observable: PlainObservable<T, TI>,
  parent: PlainObserver
};

type PlainEffect = PlainObserverBase & {
  symbol: 4,
  fn: EffectFunction,
  parent: PlainObserver
};

type PlainRoot = PlainObserverBase & {
  symbol: 5,
  parent: PlainObserver
};

type PlainSuperRoot = PlainObserverBase & {
  symbol: 6
  parent: undefined
};

type PlainObserver = PlainComputed | PlainEffect | PlainRoot | PlainSuperRoot;

/* OBSERVABLES */

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
  dispose (): void,
  isDisposed (): boolean,
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
  isDisposed (): false,
  readonly (): ObservableReadonlyAbstract<T, TI>,
  isReadonly (): true
};

type ObservableReadonlyWithoutInitial<T = unknown> = ObservableReadonlyAbstract<T, T | undefined>;

type ObservableReadonly<T = unknown> = ObservableReadonlyAbstract<T, T>;

type ObservableAny<T = unknown> = ObservableWithoutInitial<T> | Observable<T> | ObservableReadonlyWithoutInitial<T> | ObservableReadonly<T>;

type ObservableOptions<T = unknown, TI = unknown> = {
  comparator?: ComparatorFunction<T, TI>
};

type ObservableResolved<T = unknown> = T extends Observable<infer U> ? U : T extends ObservableWithoutInitial<infer U> ? U | undefined : T extends ObservableReadonly<infer U> ? U : T extends ObservableReadonlyWithoutInitial<infer U> ? U | undefined : T;

/* OBSERVERS */

type ObserverPublic = {
  dispose (): void
};

/* EXPORT */

export type {BatchFunction, CleanupFunction, ComparatorFunction, ComputedFunction, DisposeFunction, EffectFunction, ErrorFunction, FromFunction, OwnerFunction, ProduceFunction, SelectFunction, SelectorFunction, UpdateFunction};
export type {PlainObservable, PlainObserverBase, PlainComputed, PlainEffect, PlainRoot, PlainSuperRoot, PlainObserver};
export type {ObservableAbstract, ObservableWithoutInitial, Observable, ObservableReadonlyAbstract, ObservableReadonlyWithoutInitial, ObservableReadonly, ObservableAny, ObservableOptions, ObservableResolved};
export type {ObserverPublic};
