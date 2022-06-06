# Oby

A tiny Observable implementation, the brilliant primitive you need to build a powerful reactive system.

## Install

```sh
npm install --save oby
```

## APIs

| [Core](#core)                     | [Flow](#flow)             | [Utilities](#utilities)   | [Types](#types)                             |
| --------------------------------- | ------------------------- | ------------------------- | ------------------------------------------- |
| [`$()`](#core)                    | [`$.if`](#if)             | [`$.disposed`](#disposed) | [`Observable`](#observable)                 |
| [`$.batch`](#batch)               | [`$.for`](#for)           | [`$.get`](#get)           | [`ObservableReadonly`](#observablereadonly) |
| [`$.cleanup`](#cleanup)           | [`$.forIndex`](#forindex) | [`$.readonly`](#readonly) | [`ObservableOptions`](#observableoptions)   |
| [`$.computed`](#computed)         | [`$.suspense`](#suspense) | [`$.resolve`](#resolve)   | [`StoreOptions`](#storeoptions)                                            |
| [`$.context`](#context)           | [`$.switch`](#switch)     | [`$.selector`](#selector) |                                             |
| [`$.effect`](#effect)             | [`$.ternary`](#ternary)   |                           |                                             |
| [`$.error`](#error)               | [`$.tryCatch`](#trycatch) |                           |                                             |
| [`$.isObservable`](#isobservable) |                           |                           |                                             |
| [`$.isStore`](#isstore)           |                           |                           |                                             |
| [`$.on`](#on)                     |                           |                           |                                             |
| [`$.off`](#off)                   |                           |                           |                                             |
| [`$.reaction`](#reaction)         |                           |                           |                                             |
| [`$.root`](#root)                 |                           |                           |                                             |
| [`$.sample`](#sample)             |                           |                           |                                             |
| [`$.store`](#store)               |                           |                           |                                             |
| [`$.with`](#with)                 |                           |                           |                                             |

## Usage

The following functions are provided. They are just grouped and ordered alphabetically, the documentation for this library is fairly dry at the moment.

### Core

The following core functions are provided. These are functions which can't be implemented on top of the library itself, and on top of which everything else is constructed.

#### `$()`

The main exported function wraps a value into an Observable, basically wrapping the value in a reactive shell.

An Observable is a function that works both as a getter and as a setter, and it can be writable or read-only, it has the following interface:

```ts
type Observable<T> = {
  (): T,
  ( value: T ): T,
  ( fn: ( value: T ) => T ): T
};

type ObservableReadonly<T> = {
  (): T
};
```

The `$()` function has the following interface:

```ts
type ObservableOptions<T> = {
  equals?: (( value: T, valuePrev: T ) => boolean) | false
};

function $ <T> (): Observable<T | undefined>;
function $ <T> ( value: undefined, options?: ObservableOptions<T | undefined> ): Observable<T | undefined>;
function $ <T> ( value: T, options?: ObservableOptions<T> ): Observable<T>;
```

This is how to use it:

```ts
import $ from 'oby';

// Create an Observable without an initial value

$<number> ();

// Create an Observable with an initial value

$(1);

// Create an Observable with an initial value and a custom equality function

const equals = ( value, valuePrev ) => Object.is ( value, valuePrev );

const o = $( 1, { equals } );

// Create an Observable with an initial value and a special "false" equality function, which is a shorthand for `() => false`, which causes the Observable to always emit when its setter is called

const oFalse = $( 1, { equals: false } );

// Getter

o (); // => 1

// Setter

o ( 2 ); // => 2

// Setter via a function, which gets called with the current value

o ( value => value + 1 ); // => 3

// Setter that sets a function, it has to be wrapped in another function because the above form exists

const noop = () => {};

o ( () => noop );
```

#### `$.batch`

This function holds onto updates within its scope and flushes them out at once once it exits, it's useful as a performance optimizations when updating Observables multiple times whitin its scope while causing other Observables/computations/effects that depend on them to be re-evaluated only once.

Interface:

```ts
function batch <T> ( fn: () => T ): T;
function batch <T> ( value: T ): T;
```

Usage:

```ts
import $ from 'oby';

// Batch updates

const o = $(0);

$.batch ( () => {

  o ( 1 );
  o ( 2 );
  o ( 3 );

  o (); // => 0, updates have not been flushed out yet

});

o (); // => 3, now the latest update for this observable has been flushed out

// Batch a non function, it's just returned as is

$.batch ( 123 ); // => 123
```

#### `$.cleanup`

This function allows you to register cleanup functions, which are executed automatically whenever the parent computation/effect/root is disposed of, which also happens before re-evaluating it.

Interface:

```ts
function cleanup ( fn: () => void ): void;
```

Usage:

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

callback ( () => () => {} ); // Cleanups called and computed re-evaluated
```

#### `$.computed`

This is the function where the magic happens, it generates a new read-only Observable with the result of the function passed to it, the function is automatically re-executed whenever it's dependencies change, and dependencies are tracked automatically.

There are no restrictions, you can nest these freely, create new Observables inside them, whatever you want.

- **Note**: the Observable returned by a computed could always potentially resolve to `undefined` if an error is thrown inside the function but it's caught by an error handler inside it. In that scenario you should account for `undefined` in the return type yourself.
- **Note**: this function should not have side effects other than potentially updating some Observables, for side effects you should use `$.effect`.

Interface:

```ts
function computed <T> ( fn: () => T, options?: ObservableOptions<T | undefined> ): ObservableReadonly<T>;
```

Usage:

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
```

#### `$.context`

This function provides a dependency injection mechanism, you can use it to register arbitrary values with the parent computation, and those values can be read, or overridden, at any point inside that computation.

Interface:

```ts
function context <T> ( symbol: symbol ): T | undefined;
function context <T> ( symbol: symbol, value: T ): undefined;
```

Usage:

```ts
import $ from 'oby';

// Reading and writing some values in the context

$.root ( () => {

  const token = Symbol ( 'Some Context' );

  $.context ( token, { foo: 123 } ); // Writing some context

  $.effect ( () => {

    const value = $.context ( token ); // Reading some context

    console.log ( value.foo ); // => 123

    $.effect ( () => {

      $.context ( token, { foo: 321 } ); // Overriding some context

      const value = $.context ( token ); // Reading again

      console.log ( value.foo ); // => 321

    });

  });

});
```

#### `$.effect`

An effect is similar to a computed, but it returns a function for manually disposing of it instead of an Observable, and if you return a function from inside it that's automatically registered as a cleanup function.

- **Note**: this function is inteded for side effects that interact with the outside world, if you need to derive some value out of some Observables or if you need to update Observables it's recommended to instead use `$.computed`.

Interface:

```ts
function effect ( fn: () => (() => void) | void ): (() => void);
```

Usage:

```ts
import $ from 'oby';

// Create an effect with an automatically registered cleanup function

const callback = $( () => {} );

$.effect ( () => {

  const cb = callback ();

  document.body.addEventListener ( 'click', cb );

  return () => { // Automatically-registered cleanup function

    document.body.removeEventListener ( 'click', cb );

  };

});

callback ( () => () => {} ); // Cleanups called and effect re-evaluated
```

#### `$.error`

This function allows you to register error handler functions, which are executed automatically whenever the parent computation/effect/root throws. If any error handlers are present the error is caught automatically and is passed to error handlers. Errors bubble up across computations.

Remember to register your error handlers before doing anything else, or the computation may throw before error handlers are registered, in which case you won't be able to catch the error with that.

Interface:

```ts
function error ( fn: ( error: Error ) => void ): void;
```

Usage:

```ts
import $ from 'oby';

// Register an error handler function to a computed

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

#### `$.isObservable`

This function allows you to tell apart Observables from other values.

Interface:

```ts
function isObservable <T = unknown> ( value: unknown ): value is Observable<T> | ObservableReadonly<T>;
```

Usage:

```ts
import $ from 'oby';

// Checking

$.isObservable ( $() ); // => true
$.isObservable ( {} ); // => false
```

#### `$.isStore`

This function allows you to tell apart Stores from other values.

Interface:

```ts
function isStore ( value: unknown ): boolean;
```

Usage:

```ts
import $ from 'oby';

// Checking

$.isStore ( $.store ( {} ) ); // => true
$.isStore ( {} ); // => false
```

#### `$.on`

This function allows you to register a listener for a single Observable, directly, without using wrapper computeds/effects/reactions.

- **Note**: this is an advanced function intended mostly for internal usage.

Interface:

```ts
function on <T> ( observable: Observable<T> | ObservableReadonly<T>, listener: (( value: T, valuePrev?: T ) => void) ): void;
```

Usage:

```ts
import $ from 'oby';

// Register a listener for an Observable

const o = $(0);

$.on ( o, ( value, valuePrev ) => {

  console.log ( value, valuePrev ); // This function is called immediately upon registration

});

o ( 1 ); // Changing the value, causing the listener to be called again
```

#### `$.off`

This function allows you to unregister a previously registered listener from a single Observable.

- **Note**: this is an advanced function intended mostly for internal usage.

Interface:

```ts
function off <T> ( observable: Observable<T> | ObservableReadonly<T>, listener: (( value: T, valuePrev?: T ) => void) ): void;
```

Usage:

```ts
import $ from 'oby';

// Unregistering a listener for an Observable

const o = $(0);

const onChange = ( value, valuePrev ) => console.log ( value, valuePrev );

$.on ( o, onChange ); // Registering
$.off ( o, onChange ); // Unregistering

o ( 1 ); // Listener not called, because it got unregistered
```

#### `$.reaction`

A reaction is similar to an effect, except that it's not affected by suspense.

- **Note**: this is an advanced function intended mostly for internal usage, you'd almost always want to simply either use a computed or an effect.

Interface:

```ts
function reaction ( fn: () => (() => void) | void ): (() => void);
```

Usage:

```ts
import $ from 'oby';

// Create a reaction with an automatically registered cleanup function

const callback = $( () => {} );

$.reaction ( () => {

  const cb = callback ();

  document.body.addEventListener ( 'click', cb );

  return () => { // Automatically-registered cleanup function

    document.body.removeEventListener ( 'click', cb );

  };

});

callback ( () => () => {} ); // Cleanups called and reaction re-evaluated
```

#### `$.root`

This function creates a computation root, computation roots are detached from parent roots/computeds/effects and will outlive them, so they must be manually disposed of, disposing them ends all the reactvity inside them, except for any eventual nested root.
The value returned by the function is returned by the root itself.

- **Note**: the value returned by the root could always potentially resolve to `undefined` if an error is thrown inside the function but it's caught by an error handler inside it. In that scenario you should account for `undefined` in the return type yourself.

Interface:

```ts
function root <T> ( fn: ( dispose: () => void ) => T ): T;
```

Usage:

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

  console.log ( calls ); // => 1
  b (); // => 0

  a ( 1 );

  console.log ( calls ); // => 2
  b (); // => 1

  dispose (); // Now all the reactivity inside this root stops

  a ( 2 );

  console.log ( calls ); // => 2
  b (); // => 1

});
```

#### `$.sample`

This function allows for reading Observables without creating dependencies on them.

Interface:

```ts
function sample <T> ( fn: () => T ): T;
function sample <T> ( value: T ): T;
```

Usage:

```ts
import $ from 'oby';

// Sampling a single Observable

const o = $(0);

$.sample ( o ); // => 0

// Sampling multiple Observables

const a = $(1);
const b = $(2);
const c = $(3);

const sum = $.sample ( () => {
  return a () + b () + c ();
});

console.log ( sum ); // => 6

a ( 2 );
b ( 3 );
c ( 4 );

console.log ( sum ); // => 6, it's just a value, not a reactive Observable

// Sampling a non function, it's just returned as is

$.sample ( 123 ); // => 123
```

#### `$.store`

This function returns a deeply reactive version of the passed object, where property accesses and writes are automatically interpreted as Observables reads and writes for you.

You can just use the reactive object like you would with a regular non-reactive one, every aspect of the reactivity is handled for you under the hood, just remember to perform reads in a computation if you want to subscribe to them.

- **Note**: Only the following types of values will be handled by the reactivity system: plain objects, plain arrays, primitives.

- **Note**: Assignments to the following properties won't be reactive, as making those reactive would have more cons than props: `__proto__`, `prototype`, `constructor`, `hasOwnProperty`, `isPrototypeOf`, `propertyIsEnumerable`, `toLocaleString`, `toSource`, `toString`, `valueOf`, all `Array` methods.

- **Note**: Getters and setters that are properties of arrays, if for whatever reason you have those, won't be reactive.

- **Note**: Compared to Solid's `createMutable` our stores will be updated immeditely even inside a batch, it's only the reactivity system that will be udpated at the end of the batch, in theory this could cause glitches, but not doing this breaks type checking, so...

Interface:

```ts
type StoreOptions = {
  unwrap?: boolean
};

function store <T> ( value: T, options?: StoreOptions ): T;
```

Usage:

```ts
import $ from 'oby';

// Make a reactive plain object

const obj = $.store ({ foo: { deep: 123 } });

$.effect ( () => {

  obj.foo.deep; // Subscribe to "foo" and "foo.deep"

});

obj.foo.deep = 321; // Cause the effect to re-run

// Make a reactive array

const arr = $.store ([ 1, 2, 3 ]);

$.effect ( () => {

  arr.forEach ( value => { // Subscribe to the entire array
    console.log ( value );
  });

});

arr.push ( 123 ); // Cause the effect to re-run

// Get a non-reactive object out of a reactive one

const pobj = $.store ( obj, { unwrap: true } );

// Get a non-reactive array out of a reactive one

const parr = $.store ( arr, { unwrap: true } );
```

#### `$.with`

This function allows you to create a function for executing code as if it was a child of the computation active when the function was originally created.

- **Note**: this is an advanced function intended mostly for internal usage.

Interface:

```ts
function with (): (<T> ( fn: () => T ): T);
```

Usage:

```ts
import $ from 'oby';

// Reading some values from the context as if the code was executing inside a different computation

$.root ( () => {

  const token = Symbol ( 'Some Context' );

  $.context ( token, { foo: 123 } ); // Writing some context

  const runWithRoot = $.with ();

  $.effect ( () => {

    $.context ( token, { foo: 321 } ); // Overriding some context

    const value = $.context ( token ); // Reading the context

    console.log ( value.foo ); // => 321

    runWithRoot ( () => {

      const value = $.context ( token ); // Reading the context

      console.log ( value.foo ); // => 123

    });

  });

});
```

### Flow

The following flow functions are provided. These functions are like the reactive versions of native constructs in the language.

#### `$.if`

This is the reactive version of the native `if` statement. It returns a computed that resolves to the passed value if the condition is truthy, or to the optional fallback otherwise.

Interface:

```ts
function if <T, F> ( when: (() => boolean) | boolean, valueTrue: T, valueFalse?: T ): ObservableReadonly<T | F | undefined>;
```

Usage:

```ts
import $ from 'oby';

// Toggling an if

const bool = $(false);

const computed = $.if ( bool, 123, 321 );

computed (); // => 321

bool ( true );

computed (); // => 123
```

#### `$.for`

This is the reactive version of the native `Array.prototype.map`, it maps over an array of values while caching results for values that didn't change.

Interface:

```ts
function for <T, R, F> ( values: (() => readonly T[]) | readonly T[], fn: (( value: T ) => R), fallback: F | [] = [] ): ObservableReadonly<R[] | F>;
```

Usage:

```ts
import $ from 'oby';

// Map over an array of values

const o1 = $(1);
const o2 = $(2);
const os = $([ o1, o2 ]);

const mapped = $.for ( os, o => {

  return someExpensiveFunction ( o () );

});

// Update the "mapped" Observable

os ([ o1, o2, o3 ]);
```

#### `$.forIndex`

This is an alternative reactive version of the native `Array.prototype.map`, it maps over an array of values while caching results for values _whose position in the array_ didn't change.

This is an alternative to `$.for` that uses the index of the value in the array for caching, rather than the value itself.

It's recommended to use `$.forIndex` for arrays containing duplicate values and/or arrays containing primitive values, and `$.for` for everything else.

The passed function will always be called with a read-only Observable containing the current value at the index being mapped.

Interface:

```ts
type Value<T = unknown> = T extends ObservableReadonly<infer U> ? ObservableReadonly<U> : ObservableReadonly<T>;

function forIndex <T, R, F> ( values: (() => readonly T[]) | readonly T[], fn: (( value: Value<T> ) => R), fallback: F | [] = [] ): ObservableReadonly<R[] | F>;
```

Usage:

```ts
import $ from 'oby';

// Map over an array of primitive values, containing duplicates

const values = $([ 1, 1, 2, 2, 3 ]);

const mapped = $.for ( values, value => {

  return $.computed ( () => { // Wrapping in a computed to listen to changes in "value"

    return `Double: ${value () ** 2}`;

  });

});

// Update the values Observable

values ([ 1, 2, 2 ]); // Only the value at index "1" changed, so only the mapped value for that will be refreshed
```

#### `$.suspense`

This function allows you to recursively pause and resume the execution of all, current and future, effects created inside it.

This is very useful in some scenarios, for example you may want to keep a particular branch of computation around, if it'd be expensive to dispose of it and re-create it again, but you don't want its effects to be executing as they would probably interact with the rest of your application.

A parent suspense boundary will also recursively pause children suspense boundaries.

Interface:

```ts
function suspense <T> ( suspended: FunctionMaybe<unknown>, fn: () => T ): T;
```

Usage:

```ts
import $ from 'oby';

// Create a suspendable branch of computation

const title = $('Some Title');
const suspended = $(false);

$.suspense ( suspended, () => {

  $.effect ( () => {

    document.title = title (); // Changing something in the outside world, in other words performing a side effect

  });

});

// Pausing effects inside the suspense boundary

suspended ( true );

title ( 'Some Other Title' ); // This won't cause the effect to be re-executed, since it's paused

// Resuming effects inside the suspense boundary

suspended ( false ); // This will cause the effect to be re-executed, as it had pending updates
```

#### `$.switch`

This is the reactive version of the native `switch` statement. It returns a computed that resolves to the value of the first matching case, or the value of the default condition, or undefined otherwise.

Interface:

```ts
type SwitchCase<T, R> = [T, R];
type SwitchDefault<R> = [R];
type SwitchValue<T, R> = SwitchCase<T, R> | SwitchDefault<R>;

function switch <T, R> ( when: (() => T) | T, values: SwitchValue<T, R>[] ): ObservableReadonly<R | undefined>;
```

Usage:

```ts
import $ from 'oby';

// Switching cases

const o = $(1);

const result = $.switch ( o, [[1, '1'], [2, '2'], [1, '1.1'], ['default']] );

result (); // => '1'

o ( 2 );

result (); // => '2'

o ( 3 );

result (); // => 'default'
```

#### `$.ternary`

This is the reactive version of the native ternary operator. It returns a computed that resolves to the first value if the condition is truthy, or the second value otherwise.

Interface:

```ts
function ternary <T, F> ( when: (() => boolean) | boolean, valueTrue: T, valueFalse: T ): ObservableReadonly<T | F>;
```

Usage:

```ts
import $ from 'oby';

// Toggling an ternary

const bool = $(false);

const computed = $.ternary ( bool, 123, 321 );

computed (); // => 321

bool ( true );

computed (); // => 123
```

#### `$.tryCatch`

This is the reactive version of the native `try..catch` block. If no errors happen the regular value function is executed, otherwise the fallback function is executed, whatever they return is returned wrapped in a computed.

This is also commonly referred to as an "error boundary".

Interface:

```ts
function tryCatch <T, F> ( value: T, catchFn: ({ error, reset }: { error: Error, reset: () => void }) => F ): ObservableReadonly<T | F>;
```

Usage:

```ts
import $ from 'oby';

// Create an tryCatch boundary

const o = $(false);

const fallback = ({ error, reset }) => {
  console.log ( error );
  setTimeout ( () => { // Attempting to recovering after 1s
    o ( false );
    reset ();
  }, 1000 );
  return 'fallback!';
};

const regular = () => {
  if ( o () ) throw 'whoops!';
  return 'regular!';
};

const computed = $.tryCatch ( fallback, regular );

computed (); // => 'regular!'

// Cause an error to be thrown inside the boundary

o ( true );

computed (); // => 'fallback!'
```

### Utilities

The following utilities functions are provided. These functions are either simple to implement and pretty handy, or pretty useful in edge scenarios and hard to implement, so they are provided for you.

#### `$.disposed`

This function returns a read-only Observable that tells you if the parent computation got disposed of or not.

Interface:

```ts
function disposed (): ObservableReadonly<boolean>;
```

Usage:

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

url ( 'https://my.api2' ); // This causes the effect to be re-executed, and the previous `disposed` Observable will be set to `true`
```

#### `$.get`

This function gets the value out of something, if it gets passed an Observable then it calls its getter, otherwise it just returns the value.

Interface:

```ts
function get <T> ( value: T ): (T extends ObservableReadonly<infer U> ? U : T);
```

Usage:

```ts
import $ from 'oby';

// Getting the value out of an Observable

const o = $(123);

$.get ( o ); // => 123

// Getting the value out of a non-Observable

$.get ( 123 ); // => 123
$.get ( () => 123 ); // => () => 123
```

#### `$.readonly`

This function makes a read-only Observable out of any Observable you pass it. It's useful when you want to pass an Observable around but you want to be sure that they can't change it's value but only read it.

Interface:

```ts
function readonly <T> ( observable: Observable<T> | ObservableReadonly<T> ): ObservableReadonly<T>;
```

Usage:

```ts
import $ from 'oby';

// Making a read-only Observable

const o = $(123);
const ro = $.readonly ( o );

// Getting

ro (); // => 123

// Setting throws

ro ( 321 ); // An error will be thrown, read-only Observables can't be set
```

#### `$.resolve`

This function recursively resolves reactivity in the passed value. Basically it replaces each function it can find with the result of `$.computed ( () => $.resolve ( fn () ) )`.

You may never need to use this function yourself, but it's necessary internally at times to make sure that a child value is properly tracked by its parent computation.

This function is used internally by `$.if`, `$.for`, `$.switch`, `$.ternary`, `$.tryCatch`, as they need to resolve values to make sure the computed they give you can properly keep track of dependencies.

Interface:

```ts
type ResolvablePrimitive = null | undefined | boolean | number | bigint | string | symbol;
type ResolvableArray = Resolvable[];
type ResolvableObject = { [Key in string | number | symbol]?: Resolvable };
type ResolvableFunction = () => Resolvable;
type Resolvable = ResolvablePrimitive | ResolvableObject | ResolvableArray | ResolvableFunction;

const resolve = <T> ( value: T ): T extends Resolvable ? T : never;
```

Usage:

```ts
import $ from 'oby';

// Resolve a plain value

$.resolve ( 123 ); // => 123

// Resolve a function

$.resolve ( () => 123 ); // => ObservableReadonly<123>

// Resolve a nested function

$.resolve ( () => () => 123 ); // => ObservableReadonly<ObservableReadonly<123>>

// Resolve a plain array

$.resolve ( [123] ); // => [123]

// Resolve an array containing a function

$.resolve ( [() => 123] ); // => [ObservableReadonly<123>]

// Resolve an array containing arrays and functions

$.resolve ( [() => 123, [() => [() => 123]]] ); // => [ObservableReadonly<123>, [ObservableReadonly<[ObservableReadonly<123>]>]]

// Resolve a plain object

$.resolve ( { foo: 123 } ); // => { foo: 123 }

// Resolve a plain object containing a function, plain objects are simply returned as is

$.resolve ( { foo: () => 123 } ); // => { foo: () => 123 }
```

#### `$.selector`

This function is useful for optimizing performance when you need to, for example, know when an item within a set is the selected one.

If you use this function then when a new item should be the selected one the old one is unselected, and the new one is selected, directly, without checking if each element in the set is the currently selected one. This turns a `O(n)` operation into an `O(2)` one.

Interface:

```ts
type SelectorFunction<T> = ( value: T ) => ObservableReadonly<boolean>;

function selector <T> ( observable: Observable<T> | ObservableReadonly<T> ): SelectorFunction<T>;
```

Usage:

```ts
import $ from 'oby';

// Making a selector

const values = [1, 2, 3, 4, 5];
const selected = $(-1);

const select = value => selected ( value );
const selector = $.selector ( selected );

values.forEach ( value => {

  $.effect ( () => {

    const selected = selector ( value );

    if ( selected () ) return;

    console.log ( `${value} selected!` );

  });

});

select ( 1 ); // It causes only 2 effect to re-execute, not 5 or however many there are
select ( 5 ); // It causes only 2 effect to re-execute, not 5 or however many there are
```

### Types

The following TypeScript types are provided.

#### `Observable`

This type describes a regular writable Observable, like what you'd get from `$()`.

Interface:

```ts
type Observable<T> = {
  (): T,
  ( value: T ): T,
  ( fn: ( value: T ) => T ): T
};
```

#### `ObservableReadonly`

This type describes a read-only Observable, like what you'd get from `$.computed` or `$.readonly`.

Interface:

```ts
type ObservableReadonly<T> = {
  (): T
};
```

#### `ObservableOptions`

This type describes the options object that various functions can accept to tweak how the underlying Observable works.

Interface:

```ts
type ObservableOptions<T> = {
  equals?: (( value: T, valuePrev: T ) => boolean) | false
};
```

#### `StoreOptions`

This type describes the options object that the `$.store` function can accept.

Interface:

```ts
type StoreOptions = {
  unwrap?: boolean
};
```

## Thanks

- **[S](https://github.com/adamhaile/S)**: for paving the way to this awesome reactive way of writing software.
- **[sinuous/observable](https://github.com/luwes/sinuous/tree/master/packages/sinuous/observable)**: for making me fall in love with Observables and providing a good implementation that this library is based of.
- **[solid](https://www.solidjs.com)**: for being a great sort of reference implementation, popularizing Signal-based reactivity, and having built a great community.
- **[trkl](https://github.com/jbreckmckye/trkl)**: for being so inspiringly small.

## License

MIT © Fabio Spampinato
