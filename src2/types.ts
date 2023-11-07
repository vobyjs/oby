
/* TYPES - SIMPLE */

type CleanupFunction = () => void;

type ContextFunction<T = unknown> = () => T;

type Contexts = Record<symbol, any>;

type DisposeFunction = () => void;

type EqualsFunction<T = unknown> = ( value: T, valuePrev: T ) => boolean;

type ErrorFunction = ( error: Error ) => void;

type EffectFunction = () => CleanupFunction | void;

type FunctionMaybe<T = unknown> = (() => T) | T;

type MemoFunction<T = unknown> = () => T;

type UntrackFunction<T = unknown> = () => T;

type UntrackedFunction<Arguments extends unknown[], T = unknown> = ( ...args: Arguments ) => T;

type UpdateFunction<T = unknown> = ( value: T ) => T;

type WithFunction<T = unknown> = () => T;

type WrappedFunction<T = unknown> = () => T;

type WrappedDisposableFunction<T = unknown> = ( dispose: DisposeFunction ) => T;

/* TYPES - OTHERS */

type EffectOptions = {
  suspense?: boolean,
  sync?: boolean | 'init'
};

type MemoOptions<T = unknown> = {
  equals?: EqualsFunction<T> | false,
  sync?: boolean
};

type OwnerState = {
  flags: number,
  catchers: WeakRef<ErrorFunction>[],
  cleanups: Callable<CleanupFunction>[],
  contexts: Contexts,
  observable?: ObservableState<unknown>,
  observables: ObservableState[],
  observers: OwnerState[]
};

declare const ObservableSymbol: unique symbol;

type Observable<T = unknown> = {
  (): T,
  ( fn: ( value: T ) => T ): T,
  ( value: T ): T,
  readonly [ObservableSymbol]: number
};

type ObservableReadonly<T = unknown> = {
  (): T,
  readonly [ObservableSymbol]: number
};

type ObservableState<T = unknown> = {
  equals: EqualsFunction<T>,
  observers: OwnerState[],
  value: T
};

type ObservableOptions<T = unknown> = {
  equals?: EqualsFunction<T> | false
};

type Owner = {
  isContext,
  isEffect,
  isError,
  isMemo,
  isRoot,
  isSuperRoot,
  isSuspense
};

/* OTHERS */

type Callable<T extends CallableFunction> = (T & { call: CallableFunctionCall<T> }) | ({ call: CallableFunctionCall<T>, apply?: never });

type CallableFunction = ( ...args: any[] ) => any;

type CallableFunctionCall<T extends CallableFunction> = ( thiz: any, ...args: Parameters<T> ) => ReturnType<T>;

/* EXPORT */

export type {
  CleanupFunction,
  ContextFunction,
  Contexts,
  DisposeFunction,
  EqualsFunction,
  ErrorFunction,
  EffectFunction,
  FunctionMaybe,
  MemoFunction,
  UntrackFunction,
  UntrackedFunction,
  UpdateFunction,
  WithFunction,
  WrappedFunction,
  WrappedDisposableFunction,

  EffectOptions,
  MemoOptions,
  OwnerState,
  Observable,
  ObservableReadonly,
  ObservableState,
  ObservableOptions,
  Owner,

  Callable
};
