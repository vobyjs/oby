
/* OBJECTS */

type IComputed<T = unknown> = import ( '~/objects/computed' ).default<T>;

type IEffect = import ( '~/objects/effect' ).default;

type IObservable<T = unknown> = import ( '~/objects/observable' ).default<T>;

type IObserver = import ( '~/objects/observer' ).default;

type IReaction = import ( '~/objects/reaction' ).default;

type IRoot = import ( '~/objects/root' ).default;

type ISuperRoot = import ( '~/objects/superroot' ).default;

/* FUNCTIONS */

type BatchFunction<T = unknown> = () => T;

type CleanupFunction = () => void;

type ComputedFunction<T = unknown> = () => T;

type DisposeFunction = () => void;

type EffectFunction = () => CleanupFunction | void;

type ErrorFunction = ( error: Error ) => void;

type EqualsFunction<T = unknown> = ( value: T, valuePrev: T ) => boolean;

type MapFunction<T = unknown, R = unknown> = ( value: T ) => R;

type ObservedFunction<T = unknown> = () => T;

type ObservedDisposableFunction<T = unknown> = ( dispose: DisposeFunction ) => T;

type SampleFunction<T = unknown> = () => T;

type SelectorFunction<T = unknown> = ( value: T ) => boolean;

type TryCatchFunction<T = unknown> = ({ error, reset }: { error: Error, reset: DisposeFunction }) => T;

type UpdateFunction<T = unknown> = ( value: T ) => T;

/* OBSERVABLE */

type Observable<T = unknown> = {
  (): T,
  ( value: T ): T,
  ( fn: ( value: T ) => T ): T,
  readonly [ObservableSymbol]: true
};

type ObservableReadonly<T = unknown> = {
  (): T,
  readonly [ObservableSymbol]: true
};

type ObservableOptions<T = unknown> = {
  equals?: EqualsFunction<T> | false
};

declare const ObservableSymbol: unique symbol;

/* OTHERS */

type Contexts = Record<symbol, any>;

type Frozen = <T = unknown> ( value: T ) => ObservableReadonly<T>;

type FunctionMaybe<T = unknown> = (() => T) | T;

type LazyArray<T = unknown> = T[] | T | undefined;

type LazySet<T = unknown> = Set<T> | T | undefined;

type LazyValue<T = unknown> = T | undefined;

type Mapped<T = unknown, R = unknown> = { bool: boolean, value: T, result: R, root: IObserver };

type Readable = <T = unknown> ( observable: IObservable<T> ) => ObservableReadonly<T>;

type ResolvablePrimitive = null | undefined | boolean | number | bigint | string | symbol;
type ResolvableArray = Resolvable[];
type ResolvableObject = { [Key in string | number | symbol]?: Resolvable };
type ResolvableFunction = () => Resolvable;
type Resolvable = ResolvablePrimitive | ResolvableObject | ResolvableArray | ResolvableFunction;

type Resolved<T = unknown> = T;

type Selected = { count: number, value: unknown, observable: IObservable<boolean> };

type Writable = <T = unknown> ( observable: IObservable<T> ) => Observable<T>;

/* EXPORT */

export type {IComputed, IEffect, IObservable, IObserver, IReaction, IRoot, ISuperRoot};
export type {BatchFunction, CleanupFunction, ComputedFunction, DisposeFunction, EffectFunction, ErrorFunction, EqualsFunction, MapFunction, ObservedFunction, ObservedDisposableFunction, SampleFunction, SelectorFunction, TryCatchFunction, UpdateFunction};
export type {Observable, ObservableReadonly, ObservableOptions};
export type {Contexts, Frozen, FunctionMaybe, LazyArray, LazySet, LazyValue, Mapped, Readable, Resolvable, Resolved, Selected, Writable};
