# Oby

A tiny Observable implementation, the brilliant primitive you need to build a powerful reactive system.

## Install

```sh
npm install --save oby
```

## APIs

- [`$()`](#usage)
- [`$.computed`](#computed)
- [`$.context`](#context)
- [`$.cleanup`](#cleanup)
- [`$.disposed`](#disposed)
- [`$.effect`](#effect)
- [`$.error`](#error)
- [`$.batch`](#batch)
- [`$.resolve`](#resolve)
- [`$.root`](#root)
- [`$.from`](#from)
- [`$.get`](#get)
- [`$.sample`](#sample)
- [`$.selector`](#selector)
- [`$.is`](#is)

## Usage

### `$()`

The main exported function wraps a value into an Observable, basically wrapping the value in a reactive shell.

An Observable is a function that works both as a getter and as a setter, with some extra methods attached to it, it has the following interface:

```ts
type Observable<T> = {
  (): T,
  ( value: T ): T,
  get (): T,
  sample (): T,
  select <R> ( fn: ( value: T ) => R ): ObservableReadonly<R>,
  set ( value: T ): T,
  produce ( fn: ( value: T ) => T | void ): T,
  update ( fn: ( value: T ) => T ): T,
  emit (): void,
  readonly (): ObservableReadonly<T>,
  isReadonly (): false
};

type ObservableReadonly<T> = {
  (): T,
  get (): T,
  sample (): T,
  select <R> ( fn: ( value: T ) => R ): ObservableReadonly<R>,
  readonly (): ObservableReadonly<T>,
  isReadonly (): true
};
```

`$()` has the following interface:

```ts
type $ = <T> ( value?: T, options?: ObservableOptions<T> ) => Observable<T>;

type ObservableOptions<T> = {
  ComparatorFunction<T = unknown, TI = unknown> = ( value: T, valuePrev: T | TI ) => boolean;
};
```

This is how to use it:

```ts
import $ from 'oby';

// Create an Observable without an initial value

$<number>();

// Create an Observable with an initial value

$(1);

// Create an Observable with an initial value and a custom comparator

const comparator = ( value, valuePrev ) => Object.is ( value, valuePrev );

const o = $( 1, { comparator } );

// Implicit, convenient, getter

o (); // => 1

// Implicit, convenient, setter

o ( 2 ); // => 2

// "get" method for explicit getting

o.get (); // => 2

// "sample" method for explicit getting, without causing the sampled Observable to be automatically tracked as a dependency of the parent computation (read below)

o.sample (); // => 2

// "set" method for explicit setting

o.set ( 3 ); // => 3

// "update" method for setting while receiving the previous value

o.update ( prev => prev + 1 ); // => 4

// "produce" method for setting by mutating the previous value, the old value is actually transparently cloned for you so it's not actually mutated

const obj = $( { foo: { bar: true } } );

obj.produce ( prev => {
  prev.foo.bar = false;
}); // => { foo: { bar: false } }

// "select" method for creating a readonly Observable out of the return of the passed function

const objSelected = obj.select ( obj => obj.foo.bar ); // => ObservableReadonly<boolean>

// "emit" method for manually telling all observers to update themselves, useful for updating the current value efficiently by mutating it, it's only available in writable Observables

obj.emit ();

obj ().foo.bar = true; // Mutation

obj.emit ();

// "readonly" method for getting a readonly Observable out of the current one, readonly Observables provide no APIs for changing the value they are pointing to

const ro = o.readonly ();

ro (); // => 4

// "isReadonly" method for checking if the Observable is readonly

o.isReadonly (); // => false
ro.isReadonly (); // => true
```

### `$.computed`

This is the library method where the magic happens, it generates a new read-only Observable with the result of the function passed to it, the function is automatically re-executed whenever it's dependencies change, and dependencies are tracked and disposed of automatically.

There are no restrictions, you can nest these freely, create new Observables inside them, whatever you want.

Note that the Observable returned by a computed could always potentially resolve to `undefined` if an error is thrown inside the function but it's caught by an error handler inside it. In that scenario you should account for `undefined` in the return type yourself.

```ts
import $ from 'oby';

// Make a new computed Observable

const a = $(1);
const b = $(2);
const c = $(3);

const sum = $.computed ( () => {
  return a () + b () + c ();
});

sum (); // => 6

a ( 2 );

sum (); // => 7

b ( 3 );

sum (); // => 8

c ( 4 );

sum (); // => 9

// Make a new computed Observable while using the previous value

const invocations = $.computed ( prev => {
  a ();
  return prev + 1;
}, 0 );

invocations (); // => 1

a ( 10 );
a ( 11 );
a ( 12 );

invocations (); // => 4
```

### `$.context`

This function provides a dependency injection mechanism, through wich an arbitrary value can be registered with the current parent computation which can later on be retrieved from anywhere inside it via the provided token.

```ts
$.root ( () => {

  const ctx = Symbol ( 'Some Context' );

  $.context ( ctx, { foo: 123 } );

  $.effect ( () => {

    const value = $.context ( ctx );

    console.log ( value.foo ); // => 123

  });

});
```

### `$.cleanup`

This is an essential function that allows you to register cleanup functions, which are executed automatically whenever the parent computation/effect/root is disposed of, which also happens before re-evaluating it.

```ts
import $ from 'oby';

// Attach some cleanup functions to a computed

const callback = $( () => {} );

$.computed ( () => {

  const cb = callback ();

  document.body.addEventListener ( 'click', cb );

  $.cleanup ( () => {

    document.body.removeEventListener ( 'click', cb );

  });

  $.cleanup ( () => { // You can have as many cleanup functions as you want

    console.log ( 'cleaned up!' );

  });

});

callback ( () => {} ); // Cleanups called and computed re-evaluated
```

### `$.disposed`

This is a convenience function that returns a read-only Observable that tells you if the parent computation got disposed of or not.

```ts
import $ from 'oby';

// Create an effect whose function knows when it's disposed

const url = $( 'htts://my.api' );

$.effect ( () => {

  const disposed = $.disposed ();

  const onResolve = ( response: Response ): void => {

    if ( disposed () ) return; // The effect got disposed, no need to handle the response anymore

    // Do something with the response

  };

  const onReject = ( error: unknown ): void => {

    if ( disposed () ) return; // The effect got disposed, no need to handle the error anymore

    // Do something with the error

  };

  fetch ( url () ).then ( onResolve, onReject );

});

url ( 'https://my.api2' ); // This causes the effect to be re-executed, and the previous `disposed` observable will be set to `true`
```

### `$.error`

This is an essential function that allows you to register error handler functions, which are executed automatically whenever the parent computation/effect/root throws. If any error handlers are present the error is caught automatically and is passed to error handlers. Errors bubble up.

Remember to register your error handlers before doing anything else, or the computation may throw before error handlers are registered.

```ts
import $ from 'oby';

// Attach an error handler function to a computed

const o = $( 0 );

$.computed ( () => {

  $.error ( error => {

    console.log ( 'Error caught!' );
    console.log ( error );

  });

  if ( o () === 2 ) {

    throw new Error ( 'Some error' );

  }

});

o ( 1 ); // No error is thrown, error handlers are not called

o ( 2 ); // An error is thrown, so it's caught and passed to the registered error handlers
```

### `$.effect`

An effect is a special kind of computed, it returns a function for manually disposing of it, and if you return a function from inside it that's automatically registered as a cleanup function.

```ts
import $ from 'oby';

// Create an effect with an automatically attached cleanup function

const callback = $( () => {} );

$.effect ( () => {

  const cb = callback ();

  document.body.addEventListener ( 'click', cb );

  return () => {

    document.body.removeEventListener ( 'click', cb );

  };

});

callback ( () => {} ); // Cleanups called and effect re-evaluated
```

### `$.batch`

This function holds onto updates within its scope and flushes them out at once once it exits, it's useful as a performance optimizations when updating Observables multiple times while causing other Observables/computations/effects that depend on them to be re-evaluated only once.

```ts
import $ from 'oby';

// Batch updates

const o = $(0);

$.batch ( () => {

  o ( 1 );
  o ( 2 );
  o ( 3 );

  o (); // => 0, updates have not been flushed yet

});

o (); // => 3, now the latest update for this observable has been flushed
```

### `$.resolve`

This function recursively resolves functions in the passed value. Functions are called until they return something other than a function, and functions inside arrays are called too.

You may never need to use this function yourself, but it's necessary internally at times to make sure that a child value is properly tracked by its parent computation.

```ts
import $ from 'oby';

// Resolve a plain value

$.resolve ( 123 ); // => 123

// Resolve a function

$.resolve ( () => 123 ); // => 123

// Resolve a nested function

$.resolve ( () => () => () => 123 ); // => 123

// Resolve a plain array

$.resolve ( [123] ); // => [123]

// Resolve an array containing a function

$.resolve ( [() => 123] ); // => [123]

// Resolve an array containing arrays and functions

$.resolve ( [() => 123, [() => () => [() => 123]]] ); // => [123, [[123]]]
```

### `$.root`

This is an important function which creates a computation root, computation roots are detached from parent roots or computations and can be disposed, disposing them ends all the reactvity inside them.

The value returned by the function is returned by the root itself.

Note that the value returned by the root could always potentially resolve to `undefined` if an error is thrown inside the function but it's caught by an error handler inside it. In that scenario you should account for `undefined` in the return type yourself.

```ts
import $ from 'oby';

// Create a root and dispose of it

$.root ( dispose => {

  let calls = 0;

  const a = $(0);
  const b = $.computed ( () => {
    calls += 1;
    return a ();
  });

  calls; // => 1
  b (); // => 0

  a ( 1 );

  calls; // => 2
  b (); // => 1

  dispose (); // Now all the reactivity inside this root stops

  a ( 2 );

  calls; // => 2
  b (); // => 1
});
```

### `$.from`

This is a convenient function for encapsulating values that may change over time into an Observable. It's basically an effect that receives a brand new Observable inside it and returns it.

```ts
import $ from 'oby';

// Encapsulating click coordinates into an Observable

const coordinates = $.from ( observable => {

  const onClick = event => {
    const coordinates = { x: e.clientX, y: e.clientY };
    observable ( coordinates );
  });

  window.addEventListener ( 'click', onClick );

  return () => {

    window.removeEventListener ( 'click', onClick );

  };

});

$.effect ( () => {

  if ( !coordinates () ) return; // It will start empty as we did not set an initial value

  console.log ( 'click at coordinates:', coordinates () );

});
```

### `$.get`

This is a convenient function for getting the value out of something, if it gets passed an Observable then it calls `.get` on it, otherwise it just returns the value.

```ts
import $ from 'oby';

// Getting the value out of an Observable

const o = $(123);

$.get ( o ); // => 123

// Getting the value out of a non-Observable

$.get ( 123 ); // =>  123
```

### `$.sample`

This is a convenient function for computing a value out of Observables without creating dependencies on them. It's equivalent to calling `.sample` on all of them manually.

```ts
import $ from 'oby';

// Sampling

const a = $(1);
const b = $(2);
const c = $(3);

const sum = $.sample ( () => {
  return a () + b () + c ();
});

sum; // => 6

a ( 2 );
b ( 3 );
c ( 4 );

sum; // => 6, it's just a value, not a reactive Observable
```

### `$.selector`

This function is useful for optimizing performance when you need to, for example, know when an item within a set is the selected one.

This way when a new item should be the selected one the old one is unselected, and the new one is selected, directly, without checking if each element in the set is the currently selected one. This turns a `O(n)` operation into an `O(2)` one.

```ts
import $ from 'oby';

// Making a selector

const values = [1, 2, 3, 4, 5];
const selected = $(-1);

const select = value => selected ( value );
const isSelected = $.selector ( selected );

values.forEach ( value => {

  $.effect ( () => {

    if ( isSelected ( value ) ) return;

    console.log ( `${value} selected!` );

  });

});

select ( 1 );
select ( 5 );
```

### `$.is`

This essential function tells you if a value is an Observable or not.

```ts
import $ from 'oby';

// Checking

$.is ( $() ); // => true
$.is ( {} ); // => false
```

## Thanks

- **[S](https://github.com/adamhaile/S)**: for paving the way to this awesome reactive way of writing software.
- **[sinuous/observable](https://github.com/luwes/sinuous/tree/master/packages/sinuous/observable)**: for making me fall in love with Observables and providing a good implementation that this library is based of.
- **[trkl](https://github.com/jbreckmckye/trkl)**: for being so inspiringly small.

## License

MIT © Fabio Spampinato
