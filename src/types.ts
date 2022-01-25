
/* HELPERS */

//URL: https://github.com/sindresorhus/type-fest/pull/158

type PathImpl<T, Key extends keyof T> =
  Key extends string
  ? T[Key] extends Record<string, any>
    ? | `${Key}.${PathImpl<T[Key], Exclude<keyof T[Key], keyof any[]>> & string}`
      | `${Key}.${Exclude<keyof T[Key], keyof any[]> & string}`
    : never
  : never;

type PathImpl2<T> = PathImpl<T, keyof T> | keyof T;

type GetPath<T> = PathImpl2<T> extends string | keyof T ? PathImpl2<T> : keyof T;

type GetPathValue<T, P extends GetPath<T>> =
  P extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? Rest extends GetPath<T[Key]>
      ? GetPathValue<T[Key], Rest>
      : never
    : never
  : P extends keyof T
    ? T[P]
    : never;

/* MAIN */

type IDisposer = () => void;

type IFN<A extends unknown[] = unknown[], R extends unknown = unknown> = ( ...args: A ) => R;

type IListener<TI = unknown> = ( value: TI, valuePrev: TI | undefined ) => void;

type IObservableAbstract<T = unknown, TI = unknown> = {
  (): TI,
  ( value: Exclude<T, Function> | (( valuePrev: TI ) => T) ): T,
  get (): TI,
  sample (): TI,
  set ( value: T ): T,
  update <P extends GetPath<T>> ( path: P, value: GetPathValue<T, P> ): GetPathValue<T, P>,
  emit ( valuePrev?: T | undefined ): void,
  on ( listener: IListener<TI>, immediate?: boolean ): void,
  off ( listener: IListener<TI> ): void,
  computed <U> ( fn: (( value: TI ) => U), dependencies?: IObservableAbstract[] ): IObservableAbstract<U, U>,
  dispose (): void
};

type IObservableWithoutInitial<T = unknown> = IObservableAbstract<T, T | undefined>;

type IObservable<T = unknown> = IObservableAbstract<T, T>;

/* EXPORT */

export {GetPath, GetPathValue};
export {IDisposer, IFN, IListener, IObservableWithoutInitial, IObservable};
