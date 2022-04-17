
/* FUNCTIONS */

type BatchFunction = () => void;

type CleanupFunction = () => void;

type ComparatorFunction<T = unknown, TI = unknown> = ( value: T, valuePrev: T | TI ) => boolean;

type ComputedFunction<T = unknown, TI = unknown> = ( valuePrev: T | TI ) => T;

type DisposeFunction = () => void;

type EffectFunction = () => CleanupFunction | void;

type ErrorFunction = ( error: unknown ) => void;

type FromFunction<T = unknown> = ( observable: ObservableWithoutInitial<T> ) => CleanupFunction | void;

type OwnerFunction<T = unknown> = ( dispose?: DisposeFunction ) => T;

type ProduceFunction<T = unknown, R = unknown> = ( value: T ) => R | undefined;

type SelectFunction<T = unknown, R = unknown> = ( value: T ) => R;

type SelectorFunction<T = unknown> = (( value: T ) => boolean);

type UpdateFunction<T = unknown, R = unknown> = ( value: T ) => R;

/* PLAIN OBJECTS */

type PlainObservable<T = unknown, TI = unknown> = {
  value: T | TI,
  comparator: ComparatorFunction<T, TI> | null,
  observers: Set<PlainObserver> | null,
  parent: PlainComputed | null,
  disposed: boolean
};

type PlainObserverBase = {
  cleanups: CleanupFunction[] | null,
  context: Record<symbol, any> | null,
  errors: ErrorFunction[] | null,
  observables: PlainObservable[] | null,
  observers: PlainObserver[] | null
};

type PlainReactionBase = {
  stale: number // The rightmost bit indicates whether the fresh boolean is set or not, the rest makes up a counter
};

type PlainComputed<T = unknown, TI = unknown> = PlainObserverBase & PlainReactionBase & {
  parent: PlainComputed | PlainEffect | PlainRoot | PlainSuperRoot,
  observable: PlainObservable<T, TI>,
  fn: ComputedFunction<T, TI>
};

type PlainEffect = PlainObserverBase & PlainReactionBase & {
  parent: PlainComputed | PlainEffect | PlainRoot | PlainSuperRoot,
  fn: EffectFunction
};

type PlainReaction = PlainComputed | PlainEffect;

type PlainRoot = PlainObserverBase & {
  parent: PlainComputed | PlainEffect | PlainRoot | PlainSuperRoot
};

type PlainSuperRoot = PlainObserverBase & {
  parent: null
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

/* EXPORT */

export type {BatchFunction, CleanupFunction, ComparatorFunction, ComputedFunction, DisposeFunction, EffectFunction, ErrorFunction, FromFunction, OwnerFunction, ProduceFunction, SelectFunction, SelectorFunction, UpdateFunction};
export type {PlainObservable, PlainObserverBase, PlainComputed, PlainEffect, PlainReaction, PlainRoot, PlainSuperRoot, PlainObserver};
export type {ObservableAbstract, ObservableWithoutInitial, Observable, ObservableReadonlyAbstract, ObservableReadonlyWithoutInitial, ObservableReadonly, ObservableAny, ObservableOptions, ObservableResolved};
