# Oby

A rich Observable/Signal implementation, the brilliant primitive you need to build a powerful reactive system.

## Install

```sh
npm install --save oby
```

## APIs

| [Core](#core)                     | [Flow](#flow)             | [Utilities](#utilities)     | [Types](#types)                                     |
| --------------------------------- | ------------------------- | --------------------------- | --------------------------------------------------- |
| [`$()`](#core)                    | [`$.if`](#if)             | [`$.boolean`](#boolean)     | [`EffectOptions`](#effectoptions)                   |
| [`$.batch`](#batch)               | [`$.for`](#for)           | [`$.disposed`](#disposed)   | [`ForOptions`](#foroptions)                         |
| [`$.cleanup`](#cleanup)           | [`$.suspense`](#suspense) | [`$.get`](#get)             | [`MemoOptions`](#memooptions)                       |
| [`$.context`](#context)           | [`$.switch`](#switch)     | [`$.readonly`](#readonly)   | [`Observable`](#observable)                         |
| [`$.effect`](#effect)             | [`$.ternary`](#ternary)   | [`$.resolve`](#resolve)     | [`ObservableLike`](#observablelike)                 |
| [`$.isBatching`](#isbatching)     | [`$.tryCatch`](#trycatch) | [`$.selector`](#selector)   | [`ObservableReadonly`](#observablereadonly)         |
| [`$.isObservable`](#isobservable) |                           | [`$.suspended`](#suspended) | [`ObservableReadonlyLike`](#observablereadonlylike) |
| [`$.isStore`](#isstore)           |                           | [`$.untracked`](#untracked) | [`ObservableOptions`](#observableoptions)           |
| [`$.memo`](#memo)                 |                           |                             | [`StoreOptions`](#storeoptions)                     |
| [`$.observable`](#observable)     |                           |                             |                                                     |
| [`$.owner`](#owner)               |                           |                             |                                                     |
| [`$.root`](#root)                 |                           |                             |                                                     |
| [`$.store`](#store)               |                           |                             |                                                     |
| [`$.tick`](#tick)                 |                           |                             |                                                     |
| [`$.untrack`](#untrack)           |                           |                             |                                                     |
| [`$.with`](#with)                 |                           |                             |                                                     |

## Usage

The following functions are provided. They are just grouped and ordered alphabetically, the documentation for this library is relatively dry at the moment.

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

// Create an Observable with an initial value and a special "false" equality function, which is a shorthand for `() => false`, which causes the Observable to always notify its observers when its setter is called

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

Synchronous calls to Observables' setters are batched automatically for you, so unless you explicitly call a memo, or you explicitly use a synchronous effect, no computations will be re-executed until the next microtask, providing you with a pretty convenient performance guarantee. So 99.9% of the time you don't really have think about batching updates at all.

Asynchronous calls to Observable's setters though are not batched automatically, so in the niche use case where you want to pause re-executions of effects for an arbitrary period of time, until the provided function resolves, that's when you will want to use this function.

- **Note**: Calling this function with a function that doesn't return a Promise is pointless, but that's supported for convenience too, it will just not do anything special.
- **Note**: This is an advanced function that you may very well never need to call, and at most may just improve performance in some edge cases.

Interface:

```ts
function batch <T> ( fn: () => Promise<T> | T ): Promise<Awaited<T>>;
function batch <T> ( fn: T ): Promise<Awaited<T>>;
```

Usage:

```ts
import $ from 'oby';

// Batch updates until the provided async function resolves

const o = $(0);

$.effect ( () => {

  console.log ( o () );

});

$.batch ( async () => {

  o ( 1 );
  o ( 2 );
  o ( 3 );

  // Here the effect has not been called yet, because setters were called synchronously
  // Even without explicitly batching, synchronous calls to setters will be batched for you automatically

  await someAsyncAction ();

  // Here the effect has still not been called, because we are explicitly batching on an async function
  // Without batching the effect would have been called by now

});
```

#### `$.cleanup`

This function allows you to register cleanup functions, which are executed automatically whenever the parent memo/effect/root is disposed of, which also happens before re-executing it.

Interface:

```ts
function cleanup ( fn: () => void ): void;
```

Usage:

```ts
import $ from 'oby';

// Attaching some cleanup functions to an effect

const callback = $( () => {} );

$.effect ( () => {

  const cb = callback ();

  document.body.addEventListener ( 'click', cb );

  $.cleanup ( () => { // Registering a cleanup function with the parent

    document.body.removeEventListener ( 'click', cb );

  });

  $.cleanup ( () => { // You can have as many cleanup functions as you want

    console.log ( 'cleaned up!' );

  });

});

await nextTask (); // Giving the effect a chance to run

callback ( () => () => {} ); // Causing the effect to be scheduled for re-execution

await nextTask (); // Giving the effect a chance to run. Once it runs it will call the previous cleanup functions and register new ones
```

#### `$.context`

This function provides a dependency injection mechanism, you can use it to provide arbitrary values to its inner scope, and those values can be read, or overridden, at any point inside that inner scope.

Interface:

```ts
function context <T> ( symbol: symbol ): T | undefined; // Read
function context <T> ( context: Record<symbol, any>, fn: () => T ): T; // Write
```

Usage:

```ts
import $ from 'oby';

// Reading and writing some values in the context

const token = Symbol ( 'Some Context Key' );

$.context ( { [token]: 123 }, () => { // Writing a value to the context for the inner scope

  const value = $.context ( token ); // Reading a value from the context

  console.log ( value ); // => 123

  $.context ( { [token]: 321 }, () => { // Overriding some context for the inner scope

    const value = $.context ( token ); // Reading again

    console.log ( value ); // => 321

  });

});
```

#### `$.effect`

An effect is similar to a memo, but it returns a function for manually disposing of it instead of an Observable, and if you return a function from inside it that's automatically registered as a cleanup function.

Also effects are asynchronous by default, they will be re-executed automatically on the next microtask, when necessary. It's possible to make an effect synchronous also, but you are strongly discouraged to do that, because synchronous effects bypass any form of batching and are easy to misuse. It's also possible to make an effect that's asynchronous but executed immediately when created, that's way less problematic, but you probably still won't need it.

Also effects can be paused inside a `$.suspense` boundary by default. It's possible to make an effect that won't be paused inside a `$.suspense` boundary also, which is mostly useful if the effect is synchronous also, but you are discouraged to do that, unless you really need that.

There are no restrictions, you can nest these freely, create new Observables inside them, whatever you want.

- **Note**: Effects are intended for encapsulating functions that interact with the outside world, or for writing to Observables in response to a user input, which is strongly discouraged to do inside memos instead.

Interface:

```ts
type EffectOptions = {
  suspense?: boolean,
  sync?: boolean
};

function effect ( fn: () => (() => void) | void, options?: EffectOptions ): (() => void);
```

Usage:

```ts
import $ from 'oby';

// Create an asynchronous effect with an automatically registered cleanup function

const callback = $( () => {} );

$.effect ( () => {

  const cb = callback ();

  document.body.addEventListener ( 'click', cb );

  return () => { // Automatically-registered cleanup function

    document.body.removeEventListener ( 'click', cb );

  };

});

// Creating a synchronous effect, which is executed and re-executed immediately when needed

$.effect ( () => {

  // Do something...

}, { sync: true } );

// Creating an asynchronous effect, but that is executed immediately on creation

$.effect ( () => {

  // Do something...

}, { sync: 'init' } );

// Creating an effect that will not be paused by suspense

$.effect ( () => {

  // Do something...

}, { suspense: false } );
```

#### `$.isBatching`

This function tells you if explicit batching is currently active, or if there are any effects currently scheduled for execution via other means.

- **Note**: This is an advanced function that you may very well never need to call.

Interface:

```ts
function isBatching (): boolean;
```

Usage:

```ts
import $ from 'oby';

// Checking if currently batching

$.isBatching (); // => false

await $.batch ( async () => {

  $.isBatching (); // => true

});

$.isBatching (); // => false
```

#### `$.isObservable`

This function allows you to tell apart Observables from other values.

- **Note**: This function is intended mostly for internal usage, in user code you'll almost always want to unwrap whatever value you get with `$.get` instead, abstracting away the checks needed for understanding if something is an Observable or not.

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

- **Note**: This function is intended mostly for internal usage, in user code it's almost always better to not treat objects differently if they are stores or not, you can just treat them the same way and let the reactive system react to changes when needed.

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

#### `$.memo`

This is the function where most of the magic happens, it generates a new read-only Observable with the result of the function passed to it, the function is automatically marked as stale whenever its dependencies change, and its dependencies are tracked automatically. The value of the Observable is refreshed, if needed, by re-executing the memo when you ask the returned Observale for its current value, by calling it, or when any other computation depends on this memo.

Memos are asynchronous by default, they will be re-executed automatically only when/if needed. It's possible to make a memo synchronous also, but you are strongly discouraged to do that, because synchronous memos can use over-executions and are easy to misuse. Though in some edge cases they could have their usefulness, hence why they are supported.

Usually you can just pass a plain function around, in those cases the only thing you'll get out of `$.memo` is memoization, which is a performance optimization, hence the name.

There are no restrictions, you can nest these freely, create new Observables inside them, whatever you want.

- **Note**: The provided function is expected to be pure. For side effects, including for writing to other Observables, you should use `$.effect` instead.

Interface:

```ts
function memo <T> ( fn: () => T, options?: MemoOptions<T> ): ObservableReadonly<T>;
```

Usage:

```ts
import $ from 'oby';

// Make a new memoized Observable

const a = $(1);
const b = $(2);
const c = $(3);

const sum = $.memo ( () => {
  return a () + b () + c ();
});

sum (); // => 6

a ( 2 );

sum (); // => 7

b ( 3 );

sum (); // => 8

c ( 4 );

sum (); // => 9

// Make a new synchronous memo, which is executed and re-executed immediately when needed

const sumSync = $.memo ( () => {
  return a () + b () + c ();
}, { sync: true } );
```

#### `$.observable`

This is just an alias for the `$` function, without all the extra functions attached to it, for better tree-shaking.

Usage:

```ts
import {observable} from 'oby';

// Creating an Observable

const o = observable ( 1 );

// Getter

o (); // => 1

// Setter

o ( 2 ); // => 2

// Setter via a function, which gets called with the current value

o ( value => value + 1 ); // => 3
```

#### `$.owner`

This function tells you some metadata about the current owner/observer. There's always an owner.

- **Note**: This is an advanced function intended mostly for internal usage, you almost certainly don't have a use case for using this function.

Interface:

```ts
type Owner = {
  isSuperRoot: boolean, // This tells you if the nearest owner of your current code is a super root, which is kind of a default root that everything gets wrapped with
  isRoot: boolean, // This tells you if the nearest owner of your current code is a root
  isSuspense: boolean, // This tells you if the nearest owner of your current code is a suspense
  isComputation: boolean // This tells you if the nearest owner of your current code is an effect or a memo
};

function owner (): Owner;
```

Usage:

```ts
import $ from 'oby';

// Check if you are right below the super root or an effect

$.owner ().isSuperRoot; // => true
$.owner ().isComputation; // => false

$.effect ( () => {

  $.owner ().isSuperRoot; // => false
  $.owner ().isComputation; // => true

});
```

#### `$.root`

This function creates a computation root, computation roots are detached from parent roots/memos/effects and will outlive them, so they must be manually disposed of, disposing them ends all the reactvity inside them, except for any eventual nested roots.

The value returned by the function is returned by the root itself.

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
  const b = $.memo ( () => {
    calls += 1;
    return a ();
  });

  console.log ( calls ); // => 0, memos are not refreshed until necessary
  b (); // => 0
  console.log ( calls ); // => 1, now the memo got refreshed, because we asked for its value and it didn't have a fresh value

  a ( 1 );

  console.log ( calls ); // => 1, not refreshed, because we don't need the new value yet
  b (); // => 1
  console.log ( calls ); // => 2, refreshed, because we asked for a new value

  dispose (); // Now all the reactivity inside this root stops

  a ( 2 );

  console.log ( calls ); // => 2, not refreshed, because we don't need the new value yet
  b (); // => 1
  console.log ( calls ); // => 2, still not refreshed, because we disposed of the memo so its value will never change anymore

});
```

#### `$.store`

This function returns a deeply reactive version of the passed object, where property accesses and writes are automatically interpreted as Observables reads and writes for you.

You can just use the reactive object like you would with a regular non-reactive one, every aspect of the reactivity is handled for you under the hood, just remember to perform reads in a computation if you want to subscribe to them.

- **Note**: Only the following types of values will be handled automatically by the reactivity system: plain objects, plain arrays, primitives.
- **Note**: Assignments to the following properties won't be reactive, as making those reactive would have more cons than pros: `__proto__`, `prototype`, `constructor`, `hasOwnProperty`, `isPrototypeOf`, `propertyIsEnumerable`, `toLocaleString`, `toSource`, `toString`, `valueOf`, all `Array` methods.
- **Note**: Getters and setters that are properties of arrays, if for whatever reason you have those, won't be reactive.
- **Note**: Getters and setters that are assigned to symbols, if for whatever reason you have those, won't be reactive.
- **Note**: A powerful function is provided, `$.store.on`, for listening to any changes happening _inside_ a store. Changes are batched automatically within a microtask for you. If you use this function it's advisable to not have multiple instances of the same object inside a single store, or you may hit some edge cases where a listener doesn't fire because another path where the same object is available, and where it was edited from, hasn't been discovered yet, since discovery is lazy as otherwise it would be expensive.
- **Note**: A powerful function is provided, `$.store.reconcile`, that basically merges the content of the second argument into the first one, preserving wrapper objects in the first argument as much as possible, which can avoid many unnecessary re-renderings down the line. Currently getters/setters/symbols from the second argument are ignored, as supporting those would make this function significantly slower, and you most probably don't need them anyway if you are using this function.
- **Note**: The `$.store.unwrap` function unwraps the top-most proxy layer of the store only, which in most situations is equivalent to deeply unwrapping the store, and the fastest way to do it, except in one important edge case: if you are doing something that causes a proxy to be directly assigned to a property on the underlying unproxied plain object/array, which can happen when writing code like this: `myStore.foo = [myStore.obj]` for example, which should instead be written as `myStore.foo = [store.unwrap ( myStore.obj )]`. If you stumbled on this and you don't want to change your code refer to [this `deepUnwrap` function](https://github.com/vobyjs/oby/issues/8#issuecomment-1755509198).

Interface:

```ts
type StoreListenableTarget = Record<string | number | symbol, any> | (() => any);
type StoreReconcileableTarget = Record<string | number | symbol, any> | Array<any>;

type StoreOptions = {
  equals?: (( value: unknown, valuePrev: unknown ) => boolean) | false
};

function store <T> ( value: T, options?: StoreOptions ): T;

store.on = function on ( target: ArrayMaybe<StoreListenableTarget>, callback: () => void ): (() => void);
store.reconcile = function reconcile <T extends StoreReconcileableTarget> ( prev: T, next: T ): T;
store.untrack = function untrack <T> ( value: T ): T;
store.unwrap = function unwrap <T> ( value: T ): T;
```

Usage:

```ts
import $ from 'oby';

// Make a reactive plain object

const obj = $.store ({ foo: { deep: 123 } });

$.effect ( () => {

  obj.foo.deep; // Subscribe to "foo" and "foo.deep"

});

await nextTask (); // Giving the effect a chance to run

obj.foo.deep = 321; // Cause the effect to re-run, eventually

// Make a reactive array

const arr = $.store ([ 1, 2, 3 ]);

$.effect ( () => {

  arr.forEach ( value => { // Subscribe to the entire array
    console.log ( value );
  });

});

await nextTask (); // Giving the effect a chance to run

arr.push ( 123 ); // Cause the effect to re-run, eventually

// Make a reactive object, with a custom equality function, which is inherited by children also

const equals = ( value, valuePrev ) => Object.is ( value, valuePrev );

const eobj = $.store ( { some: { arbitrary: { velue: true } } }, { equals } );

// Untrack parts of a store, bailing out of automatic proxying

const uobj = $.store ({
  foo: {} // This object will become a store automatically
  bar: $.store.untrack ( {} ) // This object will stay a plain object
});

// Get a non-reactive object out of a reactive one

const pobj = $.store.unwrap ( obj );

// Get a non-reactive array out of a reactive one

const parr = $.store.unwrap ( arr );

// Reconcile a store with new data

const rec = $.store ({ foo: { deep: { value: 123, other: '123' } } });
const dataNext = { foo: { deep: { value: 321, other: '321' } } };

$.store.reconcile ( rec, dataNext ); // Now "rec" contains the data from "dataNext", but none of its internal objects, in this case, got deleted or created, they just got updated

// Listen for changes inside a store using a selector, necessary if you want to listen to a primitive

$.store.on ( () => obj.foo.deep, () => {
  console.log ( '"obj.foo.deep" changed!' );
});

// Listen for changes inside a whole store

$.store.on ( obj, () => {
  console.log ( 'Something inside "obj" changed!' );
});

// Listen for changes inside a whole sub-store, which is just another store created automatically for you really

$.store.on ( obj.foo, () => {
  console.log ( 'Something inside "obj.foo" changed!' );
});

// Listen for changes inside multiple targets, the callback will still be fired once if multiple targets are edited within the same microtask

$.store.on ( [obj, arr], () => {
  console.log ( 'Something inside "obj" and/or "arr" changed!' );
});
```

#### `$.tick`

This function forces effects scheduled for execution to be executed immediately, bypassing automatic or manual batching.

Interface:

```ts
function tick (): void;
```

Usage:

```ts
import $ from 'oby';

$.effect ( () => {
  console.log ( 'effect called' );
});

// Here the effect has not been called yet

$.tick ();

// Here the effect has been called
```

#### `$.untrack`

This function allows for reading Observables without creating dependencies on them, temporarily turning off tracking basically.

- **Note**: This function turns off tracking for any arbitrary function, the function doesn't have to be an Observable necessarily.

Interface:

```ts
function untrack <T> ( fn: () => T ): T;
function untrack <T> ( value: T ): T;
```

Usage:

```ts
import $ from 'oby';

// Untracking a single Observable

const o = $(0);

$.untrack ( o ); // => 0

// Untracking multiple Observables

const a = $(1);
const b = $(2);
const c = $(3);

const sum = $.untrack ( () => {
  return a () + b () + c ();
});

console.log ( sum ); // => 6

a ( 2 );
b ( 3 );
c ( 4 );

console.log ( sum ); // => 6, it's just a value, not a reactive Observable

// Untracking a non function, it's just returned as is

$.untrack ( 123 ); // => 123
```

#### `$.with`

This function allows you to create a function for executing code as if it was a child of the owner/computation active when the function was originally created.

- **Note**: This is an advanced function intended mostly for internal usage.

Interface:

```ts
function with (): (<T> ( fn: () => T ): T);
```

Usage:

```ts
import $ from 'oby';

// Reading some values from the context as if the code was executing inside a different computation

$.root ( () => {

  const token = Symbol ( 'Some Context Key' );

  $.context ( { [token]: 123 }, () => { // Writing a value to the context for the inner scope

    const runWithOuter = $.with ();

    $.effect ( () => {

      $.context ( { [token]: 321 }, () => { // Overriding some context for the inner scope

        const value = $.context ( token ); // Reading the context

        console.log ( value ); // => 321

        runWithOuter ( () => { // Executing the function as if it was where `$.with` was called

          const value = $.context ( token ); // Reading the context

          console.log ( value ); // => 123

        });

      });

    });

  });

});
```

### Flow

The following control flow functions are provided. These functions are like the reactive versions of native constructs in the language.

#### `$.if`

This is the reactive version of the native `if` statement. It returns a read-only Observable that resolves to the passed value if the condition is truthy, or to the optional fallback otherwise.

Interface:

```ts
function if <T, F> ( when: (() => boolean) | boolean, valueTrue: T, valueFalse?: F ): ObservableReadonly<T | F | undefined>;
```

Usage:

```ts
import $ from 'oby';

// Toggling an if

const bool = $(false);

const result = $.if ( bool, 123, 321 );

result (); // => 321

bool ( true );

result (); // => 123
```

#### `$.for`

This is the reactive version of the native `Array.prototype.map`, it maps over an array of values while caching results when possible.

This function is crucial for achieving great performance when mapping over an array, as just calling `Array.prototype.map` inside a memo can be super expensive.

There are multiple strategies that this function may use internally for caching results:

- **Keyed**: with the default options results are cached for values that didn't change, and thrown away when those values are no longer used. So for example when going from mapping over `[1, 2, 3]` to mapping over `[1, 2, 4]` the results for `1` and `2` are entirely cached, the old result for `3` is discarded, and an entirely new result for `4` is created. This is the easiest and safest strategy to use (especially in a DOM context, read [this](https://www.stefankrause.net/wp/?p=342) for more info). It's strongly recommended that the array of values to map over doesn't contain dulicates though.
- **Unkeyed**: with the `unkeyed` option set to `true` results are cached for values that didn't change, and results for old values are transformed into results for new values, if possibile, or otherwise thrown away. So for example when going from mapping over `[1, 2, 3]` to mapping over `[1, 2, 4]` the results for `1` and `2` are entirely cached, and the result for `3` is transformed into the result for `4`. Basically the function that you pass `$.for` receives an observable to the value rather than the value itself, so it can update itself, it's no longer necessary to dispose of the old result and make an entirely new result. This option is the recommended one if your array may contain duplicated primitive values, or if you want to achieve maximum performance, though it's harder to use because you will receive an observable to the value rather than the value itself, and it can be easy to misuse (especially in a DOM context, read [this](https://www.stefankrause.net/wp/?p=342) for more info).
- **Unkeyed+Pooled**: with both `unkeyed` set to `true`, and `pooled` set to `true` results are cached not only between runs, but they are also put in a suspended pool when not currently used. This is useful to trade some memory usage for potentially better runtime performance.

Interface:

```ts
function for <T, R, F> ( values: (() => readonly T[]) | readonly T[] | undefined, fn: (( value: T, index: FunctionMaybe<number> ) => R), fallback?: F | [], options?: { pooled?: false, unkeyed?: false } ): ObservableReadonly<R[] | F>;
function for <T, R, F> ( values: (() => readonly T[]) | readonly T[] | undefined, fn: (( value: ObservableReadonly<T>, index: FunctionMaybe<number> ) => R), fallback?: F | [], options?: { pooled?: boolean, unkeyed?: true } ): ObservableReadonly<R[] | F>;
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

#### `$.suspense`

This function allows you to recursively pause and resume the execution of all, current and future, effects created inside it. Unless they are explicitly created with `suspense: false`.

This is very useful in some scenarios, for example you may want to keep a particular branch of computation around, if it'd be expensive to dispose of it and re-create it again, but you may not want its effects to be executing as they would probably interact with the rest of your application.

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

This is the reactive version of the native `switch` statement. It returns a read-only Observable that resolves to the value of the first matching case, or the value of the default condition, or `undefined` otherwise.

Interface:

```ts
type SwitchCase<T, R> = [T, R];
type SwitchDefault<R> = [R];
type SwitchValue<T, R> = SwitchCase<T, R> | SwitchDefault<R>;

function switch <T, R, F> ( when: (() => T) | T, values: SwitchValue<T, R>[], fallback?: F ): ObservableReadonly<R | F | undefined>;
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

This is the reactive version of the native ternary operator. It returns a read-only Observable that resolves to the first value if the condition is truthy, or the second value otherwise.

Interface:

```ts
function ternary <T, F> ( when: (() => boolean) | boolean, valueTrue: T, valueFalse: T ): ObservableReadonly<T | F>;
```

Usage:

```ts
import $ from 'oby';

// Toggling an ternary

const bool = $(false);

const result = $.ternary ( bool, 123, 321 );

result (); // => 321

bool ( true );

result (); // => 123
```

#### `$.tryCatch`

This is the reactive version of the native `try..catch` block. If no errors happen the regular value function is executed, otherwise the fallback function is executed, whatever they return is returned wrapped in a read-only Observable.

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

const result = $.tryCatch ( fallback, regular );

result (); // => 'regular!'

// Cause an error to be thrown inside the boundary

o ( true );

result (); // => 'fallback!'
```

### Utilities

The following utilities functions are provided. These functions are either simple to implement and pretty handy, or pretty useful in edge scenarios and hard to implement, so they are provided for you.

#### `$.boolean`

This function is like the reactive equivalent of the `!!` operator, it returns you a boolean, or a function to a boolean, depending on the input that you give it.

Interface:

```ts
function boolean ( value: FunctionMaybe<unknown> ): FunctionMaybe<boolean>;
```

Usage:

```ts
import $ from 'oby';

// Implementing a custom if function

function if ( when: FunctionMaybe<unknown>, whenTrue: FunctionMaybe<unknown>, whenFalse: FunctionMaybe<unknown> ) {

  const condition = $.boolean ( when );

  return $.memo ( () => {

    return $.resolve ( $.get ( condition ) ? whenTrue : whenFalse );

  });

}
```

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

await nextTask (); // Giving the effect a chance to run

url ( 'https://my.api2' ); // This causes the effect to be re-executed, and the previous `disposed` Observable will be set to `true`
```

#### `$.get`

This function gets the value out of something, if it gets passed an Observable or a function then by default it calls it, otherwise it just returns the value. You can also opt-out of calling plain functions, which is useful when dealing with callbacks.

Interface:

```ts
function get <T> ( value: T, getFunction?: true ): (T extends (() => infer U) ? U : T);
function get <T> ( value: T, getFunction: false ): (T extends ObservableReadonly<infer U> ? U : T);
```

Usage:

```ts
import $ from 'oby';

// Getting the value out of an Observable

const o = $(123);

$.get ( o ); // => 123

// Getting the value out of a function

$.get ( () => 123 ); // => 123

// Getting the value out of an Observable but not out of a function

$.get ( o, false ); // => 123
$.get ( () => 123, false ); // => () => 123

// Getting the value out of a non-Observable and non-function

$.get ( 123 ); // => 123
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

This function recursively resolves reactivity in the passed value. Basically it replaces each function it can find with the result of `$.memo ( () => $.resolve ( fn () ) )`.

You may never need to use this function yourself, but it's necessary internally at times to make sure that a child value is properly tracked by its parent computation.

This function is used internally by `$.if`, `$.for`, `$.switch`, `$.ternary`, `$.tryCatch`, as they need to resolve values to make sure the memo they give you can properly keep track of dependencies.

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

If you use this function then when a new item should be the selected one the old one is unselected, and the new one is selected, directly, without checking if each element in the set is the currently selected one. This turns a `O(n)` operation into an `O(1)` one.

Interface:

```ts
type SelectorFunction<T> = ( value: T ) => ObservableReadonly<boolean>;

function selector <T> ( source: () => T ): SelectorFunction<T>;
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

await nextTask (); // Giving the effects a chance to run

select ( 1 ); // It causes only 2 effect to re-execute, not 5 or however many there are

await nextTask (); // Giving the effects a chance to run

select ( 5 ); // It causes only 2 effect to re-execute, not 5 or however many there are
```

#### `$.suspended`

This function returns a read-only Observable that tells you if the closest suspense boundary is currently suspended or not.

You may never need this function, but it's useful to pause or skip the execution of effectfull code scheduled outside of effects while suspense is active, since you shouldn't execute any side effects while the computation you are on is suspended, and in general you want suspended computations to stay as idle as possible.

Interface:

```ts
function suspended (): ObservableReadonly<boolean>;
```

Usage:

```ts
import {$} from 'oby';

// Scheduling an interval that won't be executed while the nearest suspense boundary is suspended

const suspended = $.suspended ();

$.effect ( () => {

  if ( suspended () ) return; // Do nothing while suspended

  const intervalId = setInterval ( doSomething, 1000 );

  return () => {

    clearInterval ( intervalId );

  };

}, { suspense: false } );
```

#### `$.untracked`

This function creates an untracked version of a value.

It's functionally equivalent to a simple `() => untrack ( value )`, but the returned function is also marked as being untracked, which allows for some optimizations internally.

Interface:

```ts
function untracked <T> ( fn: () => T ): () => T;
function untracked <T> ( value: T ): () => T;
```

Usage:

```ts
import $ from 'oby';

// Creating an untracked function

const a = $(1);
const b = $(2);
const c = $(3);

const sum = $.untracked ( () => {
  return a () + b () + c ();
});

console.log ( sum () ); // => 6

a ( 2 );
b ( 3 );
c ( 4 );

console.log ( sum () ); // => 9
```

### Types

The following TypeScript types are provided.

#### `EffectOptions`

This type describes the options object that effects can accept to tweak how they work.

Interface:

```ts
type EffectOptions = {
  suspense?: boolean,
  sync?: boolean | 'init'
};
```

#### `ForOptions`

This type describes the options object that `$.for` can accept to tweak how it works.

Interface:

```ts
type ForOptions = {
  pooled?: boolean,
  unkeyed?: boolean
};
```

#### `MemoOptions`

This type describes the options object that memos can accept to tweak how they work.

Interface:

```ts
type MemoOptions<T = unknown> = {
  equals?: (( value: T, valuePrev: T ) => boolean) | false
  sync?: boolean
};
```

#### `Observable`

This type describes a regular writable Observable, like what you'd get from `$()`.

Interface:

```ts
type Observable<T> = {
  (): T,
  ( value: T ): T,
  ( fn: ( value: T ) => T ): T,
  readonly [ObservableSymbol]: true
};
```

#### `ObservableLike`

This type describes an object with the same interface as a regular writable Observable, but which may not actually be an Observable.

Interface:

```ts
type ObservableLike<T> = {
  (): T,
  ( value: T ): T,
  ( fn: ( value: T ) => T ): T
};
```

#### `ObservableReadonly`

This type describes a read-only Observable, like what you'd get from `$.memo` or `$.readonly`.

Interface:

```ts
type ObservableReadonly<T> = {
  (): T,
  readonly [ObservableSymbol]: true
};
```

#### `ObservableReadonlyLike`

This type describes an object with the same interface as a read-only Observable, but which may not actually be an Observable.

Interface:

```ts
type ObservableReadonlyLike<T> = {
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
  equals?: (( value: unknown, valuePrev: unknown ) => boolean) | false
};
```

## Thanks

- **[reactively](https://github.com/modderme123/reactively)**: for teaching me the awesome push/pull hybrid algorithm that this library is currently using.
- **[S](https://github.com/adamhaile/S)**: for paving the way to this awesome reactive way of writing software.
- **[sinuous/observable](https://github.com/luwes/sinuous/tree/master/packages/sinuous/observable)**: for making me fall in love with Observables and providing a good implementation that this library was originally based on.
- **[solid](https://www.solidjs.com)**: for being a great sort of reference implementation, popularizing Signal-based reactivity, and having built a great community.
- **[trkl](https://github.com/jbreckmckye/trkl)**: for being so inspiringly small.

## License

MIT © Fabio Spampinato
