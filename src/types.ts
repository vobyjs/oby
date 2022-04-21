
/* OBJECTS */

type IComputed<T = unknown> = import ( '~/objects/computed' ).default<T>;

type IEffect = import ( '~/objects/effect' ).default;

type IObservable<T = unknown, TI = unknown> = import ( '~/objects/observable' ).default<T, TI>;

type IObserver = import ( '~/objects/observer' ).default;

type IReaction = import ( '~/objects/reaction' ).default;

type IRoot = import ( '~/objects/root' ).default;

type ISuperRoot = import ( '~/objects/superroot' ).default;

/* FUNCTIONS */

type BatchFunction<T = unknown> = () => T;

type CleanupFunction = () => void;

type ComparatorFunction<T = unknown, TI = unknown> = ( value: T, valuePrev: T | TI ) => boolean;

type ComputedFunction<T = unknown, TI = unknown> = ( valuePrev: T | TI ) => T;

type DisposeFunction = () => void;

type EffectFunction = () => CleanupFunction | void;

type ErrorFunction = ( error: unknown ) => void;

type FromFunction<T = unknown> = ( observable: ObservableWithoutInitial<T> ) => CleanupFunction | undefined;

type MapFunction<T = unknown, R = unknown> = ( value: T ) => R;

type ObservedFunction<T = unknown> = () => T;

type ObservedDisposableFunction<T = unknown> = ( dispose: DisposeFunction ) => T;

type ProduceFunction<T = unknown, R = unknown> = ( value: T ) => R | undefined;

type SampleFunction<T = unknown> = () => T;

type SelectFunction<T = unknown, R = unknown> = ( value: T ) => R;

type SelectorFunction<T = unknown> = ( value: T ) => boolean;

type UpdateFunction<T = unknown, R = unknown> = ( value: T ) => R;

/* OBSERVABLE */

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

/* OTHERS */

type Accessor<T, TI> = ( symbol: symbol ) => IObservable<T, TI>;

type Contexts = Record<symbol, any>;

type LazyArray<T = unknown> = T[] | T | null;

type LazyObject<T = unknown> = T | null;

type LazySet<T = unknown> = Set<T> | T | null;

type Mapped<T = unknown, R = unknown> = { bool: boolean, value: T, result: R, root: IObserver };

type Readable = <T = unknown, TI = unknown> ( observable: IObservable<T, TI> ) => ObservableReadonlyAbstract<T, TI>;

type Resolvable<R> = R | Array<Resolvable<R>> | (() => Resolvable<R>);

type Resolved<R> = R | Array<Resolved<R>>;

type Selected = { count: number, value: unknown, observable: IObservable<boolean, boolean> };

type Writable = <T = unknown, TI = unknown> ( observable: IObservable<T, TI> ) => ObservableAbstract<T, TI>;

/* EXPORT */

export type {IComputed, IEffect, IObservable, IObserver, IReaction, IRoot, ISuperRoot};
export type {BatchFunction, CleanupFunction, ComparatorFunction, ComputedFunction, DisposeFunction, EffectFunction, ErrorFunction, MapFunction, FromFunction, ObservedFunction, ObservedDisposableFunction, ProduceFunction, SampleFunction, SelectFunction, SelectorFunction, UpdateFunction};
export type {ObservableAbstract, ObservableWithoutInitial, Observable, ObservableReadonlyAbstract, ObservableReadonlyWithoutInitial, ObservableReadonly, ObservableAny, ObservableOptions, ObservableResolved};
export type {Accessor, Contexts, LazyArray, LazyObject, LazySet, Mapped, Readable, Resolvable, Resolved, Selected, Writable};
