
/* OBJECTS */

type IEffect = import ( '~/objects/effect' ).default;

type IMemo<T = unknown> = import ( '~/objects/memo' ).default<T>;

type IObservable<T = unknown> = import ( '~/objects/observable' ).default<T>;

type IObservableParent = Pick<IObserver, 'observables' | 'update'>;

type IObserver = import ( '~/objects/observer' ).default;

type IOwner = import ( '~/objects/owner' ).default;

type IRoot = import ( '~/objects/root' ).default;

type ISchedulerAsync = typeof import ( '~/objects/scheduler.async' ).default;

type ISchedulerSync = typeof import ( '~/objects/scheduler.sync' ).default;

type ISuperRoot = import ( '~/objects/superroot' ).default;

type ISuspense = import ( '~/objects/suspense' ).default;

/* FUNCTIONS */

type BatchFunction<T = unknown> = () => PromiseMaybe<T>;

type CallbackFunction = () => void;

type CleanupFunction = () => void;

type DisposeFunction = () => void;

type EffectFunction = () => CleanupFunction | void;

type ErrorFunction = ( error: Error ) => void;

type EqualsFunction<T = unknown> = ( value: T, valuePrev: T ) => boolean;

type MapFunction<T = unknown, R = unknown> = ( value: T, index: ObservableReadonly<number> ) => R;

type MapValueFunction<T = unknown, R = unknown> = ( value: Indexed<T>, index: ObservableReadonly<number> ) => R;

type MemoFunction<T = unknown> = () => T;

type SelectorFunction<T = unknown> = ( value: T ) => ObservableReadonly<boolean>;

type SuspenseFunction<T = unknown> = () => T;

type TryCatchFunction<T = unknown> = ({ error, reset }: { error: Error, reset: DisposeFunction }) => T;

type UntrackFunction<T = unknown> = () => T;

type UpdateFunction<T = unknown> = ( value: T ) => T;

type WithFunction<T = unknown> = () => T;

type WrappedFunction<T = unknown> = () => T;

type WrappedDisposableFunction<T = unknown> = ( dispose: DisposeFunction ) => T;

/* EFFECT */

type EffectOptions = {
  suspense?: boolean,
  sync?: boolean | 'init'
};

/* FOR */

type ForOptions = {
  unkeyed?: boolean
};

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

/* OWNER */

type Owner = {
  isSuperRoot: boolean,
  isRoot: boolean,
  isSuspense: boolean,
  isComputation: boolean
};

/* STORE */

type StoreOptions = {
  equals?: EqualsFunction<unknown> | false
};

/* OTHERS */

type ArrayMaybe<T = unknown> = T | T[];

type Callable<T extends CallableFunction> = (T & { call: CallableFunctionCall<T> }) | ({ call: CallableFunctionCall<T>, apply?: never });

type CallableFunction = ( ...args: any[] ) => any;

type CallableFunctionCall<T extends CallableFunction> = ( thiz: any, ...args: Parameters<T> ) => ReturnType<T>;

type Constructor<T = unknown, Arguments extends unknown[] = []> = { new ( ...args: Arguments ): T };

type Contexts = Record<symbol, any>;

type FunctionMaybe<T = unknown> = (() => T) | T;

type Indexed<T = unknown> = T extends ObservableReadonly<infer U> ? ObservableReadonly<U> : ObservableReadonly<T>;

type LazyArray<T = unknown> = T[] | T | undefined;

type LazySet<T = unknown> = Set<T> | T | undefined;

type LazyValue<T = unknown> = T | undefined;

type PromiseMaybe<T = unknown> = T | Promise<T>;

type ResolvablePrimitive = null | undefined | boolean | number | bigint | string | symbol;
type ResolvableArray = Resolvable[];
type ResolvableObject = { [Key in string | number | symbol]?: Resolvable };
type ResolvableFunction = () => Resolvable;
type Resolvable = ResolvablePrimitive | ResolvableObject | ResolvableArray | ResolvableFunction;

type Resolved<T = unknown> = T;

type Signal = { disposed: boolean };

/* EXPORT */

export type {IEffect, IMemo, IObservable, IObservableParent, IObserver, IOwner, IRoot, ISchedulerAsync, ISchedulerSync, ISuperRoot, ISuspense};
export type {BatchFunction, CallbackFunction, CleanupFunction, DisposeFunction, EffectFunction, ErrorFunction, EqualsFunction, MapFunction, MapValueFunction, MemoFunction, SelectorFunction, SuspenseFunction, TryCatchFunction, UntrackFunction, UpdateFunction, WithFunction, WrappedFunction, WrappedDisposableFunction};
export type {EffectOptions};
export type {ForOptions};
export type {Observable, ObservableReadonly, ObservableOptions};
export type {Owner};
export type {StoreOptions};
export type {ArrayMaybe, Callable, CallableFunction, Constructor, Contexts, FunctionMaybe, Indexed, LazyArray, LazySet, LazyValue, PromiseMaybe, Resolvable, Resolved, Signal};
