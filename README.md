# Oby

A tiny Observable implementation.

An Observable is an amazingly simple yet extremely powerful reactive primitive.

## Install

```sh
npm install --save oby
```

## Usage

An Observable is a function that works both as a getter and as a setter, with some extra methods attached to it, it has the following interface:

```ts
type Observable<T> = {
  (): T,
  ( value: Exclude<T, Function> | (( valuePrev: T ) => T) ): T,
  get (): T,
  sample (): T,
  set ( value: T ): T,
  on ( listener: (( value: T, valuePrev: T | undefined ) => void), immediate?: boolean ): void,
  off ( listener: (( value: T, valuePrev: T | undefined ) => void) ): void,
  computed <U> ( fn: (( value: T ) => U), dependencies?: Observable[] ): Observable<U>,
  dispose (): void
};
```

You would use the library like this:

```ts
import oby from 'oby';

// Create an observable without an initial value

oby<number> ();

// Create an observable with an initial value

const o = oby ( 1 );

// Create an observable with an initial value and a disposer function

const disposable = oby ( 1, () => console.log ( 'Dispose!' ) );

disposable.dispose (); // Call the disposer function, future calls to #dispose will be no-ops

// "get" method for explicit getting

o.get (); // => 1

// "sample" method for explicit getting, without causing the sampled observable to be automatically linked as a dependency of the "computed" observable (read below)

o.sample (); // => 1

// "set" method for explicit setting

o.set ( 2 ); // => 2

// "on" method for subscribing to updates

const subscriber = ( value, valuePrev ) => {
  console.log ( 'The value changed!', value, valuePrev );
};

o.on ( subscriber ); // Subscribing for later updates, not called immediately

o.set ( 2 ); // Same value as before, subscribers aren't called
o.set ( 3 ); // Different value, subscribers are called

// "off" method for unsubscribing from updates

const subscriber = () => console.log ( 'Update!' );

o.on ( subscriber );
o.off ( subscriber );

o.set ( 4 ); // No subscribers are actually called, because they unsubscribed already

// Subscribing immediately

o.on ( subscriber, true ); // Subscribing for later updates, but also called immediately

// Implicit, convenient, getter

o (); // => 4

// Implicit, convenient, setters

o ( 5 ); // => 5
o ( prev => prev + 1 ); // => 6

// "computed" method, for making an Observable out of the current Observable, this assumes that the function only depends on the current Observable and is therefor strictly less powerful than the "computed" library method, but by having that assumption it's also slightly faster

const double = o.computed ( value => value * value );

double (); // => 36

o ( 10 );

double (); // => 100

// "computed" library method, for making an Observable out of other Observables

const a = oby ( 1 );
const b = oby ( 2 );
const c = oby.computed ( () => a () + b () );

c (); // => 3

a ( 2 );

c (); // => 4

b ( 10 );

c (); // => 12

c.dispose (); // Call the disposer function, which stops the reactivity

b ( 20 );

c (); // => 12, same value as before, it's no longer reactive

// "from" library method, for encapsulating dynamic stuff in an Observable

const oClick = oby.from ( observable => {
  const onClick = event => {
    const coordinates = { x: e.clientX, y: e.clientY };
    observable ( coordinates );
  });
  window.addEventListener ( 'click', onClick );
  return () => { // Optional disposer function provided, necessary if you want to stop listening eventually
    window.removeEventListener ( 'click', onClick );
  };
});

oClick.on ( coordinates => console.log ( coordinates ) );

oClick.dispose (); // Execute the disposer function

// "is" library method, for checking if a value is an Observable

oby.is ( o ); // => true
oby.is ( {} ); // => false
```

## Thanks

- **[sinuous/observable](https://github.com/luwes/sinuous/tree/master/packages/sinuous/observable)**: for making me fall in love with Observables.
- **[trkl](https://github.com/jbreckmckye/trkl)**: for being so amazingly small and providing a good sort of reference implementation.

## License

MIT © Fabio Spampinato
