
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
  on ( listener: IListener<TI>, immediate?: boolean ): void,
  off ( listener: IListener<TI> ): void,
  computed <U> ( fn: (( value: TI ) => U), dependencies?: IObservableAbstract[] ): IObservableAbstract<U, U>,
  dispose (): void
};

type IObservableWithoutInitial<T = unknown> = IObservableAbstract<T, T | undefined>;

type IObservable<T = unknown> = IObservableAbstract<T, T>;

/* EXPORT */

export {IDisposer, IFN, IListener, IObservableWithoutInitial, IObservable};
