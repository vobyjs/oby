
/* OBJECTS */

type IComputation = import ( '~/objects/computation' ).default;

type IComputed<T = unknown> = import ( '~/objects/computed' ).default<T>;

type IEffect = import ( '~/objects/effect' ).default;

type IObservable<T = unknown> = import ( '~/objects/observable' ).default<T>;

type IObserver = import ( '~/objects/observer' ).default;

type IReaction = import ( '~/objects/reaction' ).default;

type IRoot = import ( '~/objects/root' ).default;

type ISuperRoot = import ( '~/objects/superroot' ).default;

type ISuspense = import ( '~/objects/suspense' ).default;

/* FUNCTIONS */

type BatchFunction<T = unknown> = () => T;

type CleanupFunction = () => void;

type ComputedFunction<T = unknown> = () => T;

type DisposeFunction = () => void;

type EffectFunction = () => CleanupFunction | void;

type ErrorFunction = ( error: Error ) => void;

type EqualsFunction<T = unknown> = ( value: T, valuePrev: T ) => boolean;

type ListenerFunction<T = unknown> = ( value: T, valuePrev?: T ) => void;

type MapFunction<T = unknown, R = unknown> = ( value: T, index: ObservableReadonly<number> ) => R;

type MapIndexFunction<T = unknown, R = unknown> = ( value: Indexed<T>, index: number ) => R;

type MapValueFunction<T = unknown, R = unknown> = ( value: Indexed<T>, index: ObservableReadonly<number> ) => R;

type ObservedFunction<T = unknown> = () => T;

type ObservedDisposableFunction<T = unknown> = ( dispose: DisposeFunction ) => T;

type ReactionFunction = () => CleanupFunction | void;

type SelectorFunction<T = unknown> = ( value: T ) => ObservableReadonly<boolean>;

type SuspenseFunction<T = unknown> = () => T;

type TryCatchFunction<T = unknown> = ({ error, reset }: { error: Error, reset: DisposeFunction }) => T;

type UntrackFunction<T = unknown> = () => T;

type UpdateFunction<T = unknown> = ( value: T ) => T;

type WithFunction<T = unknown> = () => T;

/* OBSERVABLE */

type Observable<T = unknown> = {
  (): T,
  ( fn: ( value: T ) => T ): T,
  ( value: T ): T,
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

/* STORE */

type StoreOptions = {
  unwrap?: boolean
};

/* OTHERS */

type Callable<T extends CallableFunction> = (T & { call: CallableFunctionCall<T> }) | ({ call: CallableFunctionCall<T>, apply?: never });

type CallableFunction = ( ...args: any[] ) => any;

type CallableFunctionCall<T extends CallableFunction> = ( thiz: any, ...args: Parameters<T> ) => ReturnType<T>;

type Constructor<T = unknown, Arguments extends unknown[] = []> = { new ( ...args: Arguments ): T };

type Contexts = Record<symbol, any>;

type Frozen = <T = unknown> ( value: T ) => ObservableReadonly<T>;

type FunctionMaybe<T = unknown> = (() => T) | T;

type Indexed<T = unknown> = T extends ObservableReadonly<infer U> ? ObservableReadonly<U> : ObservableReadonly<T>;

type LazyArray<T = unknown> = T[] | T | undefined;

type LazySet<T = unknown> = Set<T> | T | undefined;

type LazyValue<T = unknown> = T | undefined;

type Mapped<T = unknown> = { bool: boolean, result: T, root: IObserver };

type Readable = <T = unknown> ( observable: IObservable<T> ) => ObservableReadonly<T>;

type ResolvablePrimitive = null | undefined | boolean | number | bigint | string | symbol;
type ResolvableArray = Resolvable[];
type ResolvableObject = { [Key in string | number | symbol]?: Resolvable };
type ResolvableFunction = () => Resolvable;
type Resolvable = ResolvablePrimitive | ResolvableObject | ResolvableArray | ResolvableFunction;

type Resolved<T = unknown> = T;

type Signal = { disposed?: boolean };

type Writable = <T = unknown> ( observable: IObservable<T> ) => Observable<T>;

/* EXPORT */

export type {IComputation, IComputed, IEffect, IObservable, IObserver, IReaction, IRoot, ISuperRoot, ISuspense};
export type {BatchFunction, CleanupFunction, ComputedFunction, DisposeFunction, EffectFunction, ErrorFunction, EqualsFunction, ListenerFunction, MapFunction, MapIndexFunction, MapValueFunction, ObservedFunction, ObservedDisposableFunction, ReactionFunction, SelectorFunction, SuspenseFunction, TryCatchFunction, UntrackFunction, UpdateFunction, WithFunction};
export type {Observable, ObservableReadonly, ObservableOptions};
export type {StoreOptions};
export type {Callable, CallableFunction, Constructor, Contexts, Frozen, FunctionMaybe, Indexed, LazyArray, LazySet, LazyValue, Mapped, Readable, Resolvable, Resolved, Signal, Writable};
