### Version 15.1.2
- `$.store`: ensuring that when deleting a property the eventual getter and setter associated with it are fully forgotten
- `$.store`: ensuring properties implicitly deleted by shrinking an array are handled too
- `$.store`: ensuring it reacts when the length property is updated implicitly

### Version 15.1.1
- `$.store`: ensuring frozen objects are returned as is, to respect a proxy trap invariant
- `$.store`: ensuring non-configurable non-writable properties are returned as is, to respect a proxy trap invariant
- `$.store`: ensuring the getter is not called when setting if there is no setter
- `$.store`: ensuring already proxied objects don't get reproxied, and their equality function is not overridden

### Version 15.1.0
- Readme: updated types for $.for
- `$.boolean`: optimized when used in combination with `$.if`, `$.ternary` and `$.switch`

### Version 15.0.0
- `$.ternary`: optimized some common cases, creating 1 fewer memo
- `$.for`: added a fast path for plain arrays, where the index you receive is a raw number

### Version 14.3.5
- Readme: aded a warning about `$.store.unwrap`
- `$.for`: added support for receiving an undefined value, for convenience

### Version 14.3.4
- Exporting the `SYMBOL_STORE_TARGET` symbol

### Version 14.3.3
- `$.store`: fixed an issue with listening for top-level array stores

### Version 14.3.2
- `$.untrack`: improved types, accounting for FunctionMaybe types explicitly, which TS seems to need
- `$.store`: fixed an issue where setting a property pointing to a store with defineProperty set the store itself, rather than the object it points to

### Version 14.3.1
- Readme: avoiding mentioning the EqualsFunction internal type
- `$.store`: fixed handling of changes in "in" checks when defining properties on the store

### Version 14.3.0
- `$.memo`: added support for making a synchronous one

### Version 14.2.3
- Fixed a huge bug where effects and memos could fail to refresh themselves in some cases

### Version 14.2.2
- `$.for`: ensuring pooled results can work with a parent suspense boundary too

### Version 14.2.1
- Tweaked fallback "unavailable" value to be less prone to be misused

### Version 14.2.0
- New types: ObservableLike, ObservableReadonlyLike

### Version 14.1.4
- `$.context`: ensuring it gets disposed properly by its owner
- `$.context`: ensuring effects created inside it can be suspended properly

### Version 14.1.3
- Ensuring synchronous effects are also refreshed only if some of their dependencies change

### Version 14.1.2
- `$.boolean`: optimized for frozen observables too
- `$.memo`: optimized for frozen observables too
- `$.switch`: simplified and optimized

### Version 14.1.1
- `$.untracked`: ensuring it supports functions with arguments too

### Version 14.1.0
- `$.untracked`: a new method for creating an untracked function, in an optimized way
- `$.boolean`: optimized for untracked functions, 7x faster for them
- `$.memo`: optimized for untracked functions, 4x faster for them
- `$.switch`: optimized for untracked functions and frozen observables, 4x faster for them

### Version 14.0.3
- Simplified some logic around memo disposal
- Refined mangling, avoiding mangling properties used by Voby

### Version 14.0.2
- Keeping track of whether each owner is permanently disposed or not, simplifying some code

### Version 14.0.1
- `$.switch`: ensuring every case where the condition is not actually reactive and neither is the return value is optimized

### Version 14.0.0
- `$.switch`: optimized to create as few memos as possible, which sometimes mean 0 memos, rather than 2
- `$.context`: rewritten to make lookups basically free, but the API for setting it is different now
- Granularly check if Suspense is enabled for the given computation, rather than having just a global flag

### Version 13.2.0
- `$.untrack`: optimized slightly, mainly simplifying call stacks in some cases
- `$.suspended`: a new method that tells you if you are under a suspended computation or not

### Version 13.1.4
- Observer: always deduplicating observers exactly, as otherwise it's just buggy
- Observer: optimized disposal when just replacing the last observable in the list with another
- Minor changes
- Reorganized observables collection, making the code more manageable

### Version 13.1.3
- Updated changelog
- Renamed "benchmark" task to "cellx"
- Observer: avoiding registering on the parent if the parent is the super root
- Kairo: added a "createComputations1to1" test
- Observer: ensuring the disposal optimization doesn't cause erroneous over-executions in edge cases

### Version 13.1.2
- Readme: updated signature for `$.batch`
- Readme: ensuring `$.tick` is documented
- `$.effect`: ensuring the disposal optimization is actually performed on effects
- `$.effect`: optimized re-execution, skippung unnecessary unscheduling
- Observer: slightly optimized deduplication of observables
- `$.effect`: avoiding scheduling it if under a suspended suspense
- `$.suspense`: ensuring dirty effects with sync: init are refreshed immediately too when the boundary unsuspends
- Ensuring disposed effects are not re-executed more efficiently
- Async scheduler: optimized, since we don't actually need the deduplication that Sets provide
- Sync scheduler: optimized, since we don't actually need the deduplication that Sets provide
- `$.for`: added a "pooled" option for the unkeyed strategy

### Version 13.1.1
- Fixed a typo

### Version 13.1.0

- Readme: documented the "observable" function
- Observable: marking it as disposed, and avoiding registering it as a dependency, when the parent memo, if any, will never be re-executed
- Observable: considering disposed ones as frozen
- `$.switch`: optimized for static cases
- `$.selector`: optimized for a static source
- `$.disposed`: slightly cleaner implementation
- Memo: slightly optimized stale propagation
- `$.suspense`: slightly cleaner implementation
- `$.effect`: added another tier of synchronousness, "init"
- Scheduler: ensuring all queued effects get executed, even if scheduled while flushing
- New method: `$.tick`, for manually forcefully flushing the effects queue
- Improved mangling, mangling more names
- Optimized disposal performance for memos
- Observer: deduplicating dependencies exactly up to 64 dependencies
- `$.with`: ensuring it doesn't dispose of pre-existing dependencies
- `$.observable`: ensuring it's attached to the default export also, for consistency
- Optimized disposal performance for effects also
- Improved handling of uninitialized observables and throwing owners

### Version 13.0.0

Lots of big fundamental changes:

- The algorithm that powers the reactivity system changed. Previously it was an eager algorithm, where as soon as an observable was modified it immediately notified its observers (effects and memos), and those observers would be re-executed immediately, in the right order. Now the algorithm is lazy, nothing (with the exception of sync effects) will be refreshed immediately, everything will wait until you actually need a fresh value.
- `$.memo` is now lazy, the function you pass to it is not called immediately, and it's not called or refresh at all unless you need it to. So the function is essentially called only when the observable that the memo returns you is called (unless the value was fresh already) -- either manually by you, or by some other memo, or by some effect. This provides some performance guarantees, because now memos that you don't actually read don't cost you anything.
- `$.effect` is lazy now, effects will be scheduled for execution in the next microtask, rather than immediately as soon as a change happens. This is also a big performance guarantee, because if for example an effect depends on multiple observables, and those observables are updated synchronously one after the other the effect will still at most run once after the update. Also in the context of Voby this ensures that the DOM is written to only after you are done with updating your observables, ensuring that layout and style recalculations won't be thrashed.
- `$.effect` now has an optional second argument, an options object, with an option for turning off suspense for it, ensuring that the effect will never be paused by `$.suspense`, and an option for making it synchronous. Synchronous effects are **strongly** discouraged, you should probably never need to use them. But they are there because in some very niche cases they are actually useful.
- Setting an observable inside a `$.memo` is strongly discouraged, it was discouraged in the past also, but now your memo containing that side effect may just not run at all, breaking your code. You should pretty much always set a observable inside an effect instead, or outside any effect or memo (like in an event handler). I'm considering making setting an observable inside a `$.memo` throw even.
- `$.reaction` got deleted, it's effectively replaced by `$.effect ( () => {...}, { sync: true, suspense: false } )`, you probably pretty much never actually want to make an effect with custom options, that's a pretty niche and kinda advanced thing that's largely unnecessary.
- `$.error` got deleted, as it introduced a bunch of edge cases since you could have multiple error handlers attached to the same owner, and it was unclear what should happen with those. Now you need to use `$.tryCatch` to catch errors basically.
- `$.on` and `$.off` got deleted, because they way they worked doesn't fit the new lazy system. Though potentially something similar could be reintroduced in the future, because they enabled a nice optimization.
- `$.forIndex` got deleted, you basically always want to use `$.forValue` instead, the main difference would be that `$.forIndex` kept the order of your results stable, while `$.forValue` may not, if you need that you can sort the results you got yourself after calling the function.
- `$.forValue` got deleted, instead `$.for` now supports an options object. With no options it works like it did before, but with `{ unkeyed: true }` you basically opt into using the logic that `$.forValue` provided. Potentially new iterations strategies may be added in the future behind other options.
- `$.batch` became basically useless, the system is lazy so it's as if synchronous changes are batched automatically for you, all the time, in a more efficient manner than was possible before. `$.batch` still exists to block effects from re-executing until an async function resolves, which is a pretty niche case, you can basically just ignore batching now.
- `$.isBatching` now tells not only that manual async batching is in currently in use, but also if there are any effects scheduled for execution in the future, basically. It's almost an `$.isIdle` function.
- In the cellx benchmark previously the library ran out of stack frames around 2500 layers, now it seems to be able to get to around 7000 layers no problem.
- In the cellx benchmark, without using synchronous effects, performance improved by some 30%.
- The codebase should be easier to maintain, and easier to contribute to, the code just got simpler.

More details and cons:

- The system is lazy, but potentially some effects and memos may still fire unnecessarily, for example if an observable starts with a value of 0, and you change it to 1 and then immediately back to 0 again then its observers will still see that something changed, while in reality it didn't, actually. Keeping track of those sort of changes seems counter productive, so we accept that effects and memos can still over-fire some times in edge cases, essentially.
- Memory usage got higher, potentially significantly so, around within 2x maaaaybe in bad scenarios. The previous version was super memory-usage optimized though, so this isn't as bad as it may sound. It probably doesn't matter much, we are still talking about an extra 10MB of memory for a big app or something like that, but the increase is there. Some of this could be trimmed away in the future.
- Debugging gor potentially harder, because when you create a memo it's not executed immediately, the order in which things execute, and when things execute, is just more complicated. We'll probably have to add some tools to aid debugging, like being able to fire the debugger automatically whenever a computation is refreshed.
- While synchronous effects exist, and are supported, they are strongly discouraged. Not only they are just slower to call, but they also mess with the execution model and may lead you in weird edge cases if misused, better to never use them if you can.
- Instantiation of observables got a bit slower. Maybe this could be improved in the future.
- Cleanup of observers got a bit slower. Maybe this could be improved in the future.

Overall I think the API got way simpler in many cases, harder to misuse, we got some nice performance guarantees and improvements, but there are some downsides to it. Let me know if you hit any rough corners.

### Version 12.7.2
- `$.for/forIndex/forValue`: ensuring it accounts for changes in the sorting order of results

### Version 12.7.1
- `$.switch`: ensuring it keeps in memory one fewer memo when the condition is static

### Version 12.7.0
- `$.for`: returning the same exact array of results if the mapped values stayed exactly the same
- `$.forIndex`: added cached/uncached metadata to the results array too, like `$.for`
- `$.forValue`: added cached/uncached metadata to the results array too, like `$.for`

### Version 12.6.3
- `$.batch`: added a fixme
- `$.store.reconcile`: ensuring it doesn't break reactivity

### Version 12.6.2
- `$.store.reconcile`: ensuring it updates the length of top-level arrays also

### Version 12.6.1
- Lowercased readme file
- Lowercased license file
- Simplified benchmark configuration
- Readme: updated thanks section
- Observer: avoiding automatically logging the stack of unhandled errors, as that's incorrect in some cases

### Version 12.6.0
- Store: running the benchmark with tracking on
- Minor tweak: deleted 2 unnecessary property accesses
- Deleted useless internal BATCH_COUNT constant
- Updated dependencies
- `$.batch`: slightly simplified
- `$.isObservable`: checking for the specific symbols rather than the general one
- Moved some utilities from constants.ts to utils.ts
- max: removed a type assertion
- Moved symbols to their own file
- Status: slightly simplified setting the fresh bit
- Removed constant wrappers, relying instead on live bindings for exports
- Observable: slightly simplified self-registration logic
- Reversed a change that apparently made performance worse
- Reversed cleanup order, so that it's playing a movie in reverse
- `$.selector`: simplified signal creation, no need to reference the root too
- `$.store`: added support for setting a custom equality function
- Ensuring a couple of property accesses are not interfered with by mangling
- Ensuring errors thrown inside error handlers are handled properly
- Observable: slightly optimized disposal, avoiding changing the shape of the object, without sacrificing memory usage for it
- `$.selector`: optimized the case where the source is a frozen observable
- Added a missing semicolon
- `$.selector`: ensuring the source function is normalized to an observable, for better performance
- `$.selector`: ensuring it throws if used after being disposed

### Version 12.5.4
- Updated some dependencies
- Fixed TypeScript type issues
- Added a todo
- Observer: automatically logging the stack of an uncaught error, for convenience

### Version 12.5.3
- New symbol: SYMBOL_STORE_KEYS, for efficiently listening to keys only, without reading them
- `$.store`: ensuring the get trap exists right after listening to keys and values

### Version 12.5.2
- Removed internal temporary test
- Exporting the SYMBOL_STORE_VALUES symbol too

### Version 12.5.1
- Observable: optimized duplicate registrations in some cases

### Version 12.5.0
- Updated some dependencies
- `$.store.untrack`: a new store utility for bailing out of automatic proxying

### Version 12.4.8
- `$.store`: added support for proxying any object, if done explicitly
- `$.store`: detecting getters and setters more memory efficiently
- `$.store`: added a little benchmark measuring creation time
- `$.store`: removed support for getters and setters assigned to symbols, as they are too much of a performance issue

### Version 12.4.7
- `$.for`: optimized cleanup when new items are added to the array without removing any items

### Version 12.4.6
- For: using an internal symbol for enabling an optimization in Voby

### Version 12.4.5
- Renamed an internal symbol, and refactored `$.resolve` to squeeze a little more performance in some cases

### Version 12.4.4
- `$.selector`: ensuring the source function is memoized

### Version 12.4.3
- `$.isObservableFrozen/isObservableReadable/isObservableWritable`: simplified internal implementation slightly
- `$.target`: simplified internal implementation slightly
- `$.effect`/`$.reaction`: freeing up memory when the function will never be executed again in more scenarios
- readable: just producing frozen observables if we are dealing with disposed ones, which can never change
- `$.memo`: freeing up memory when the function will never be executed again in more scenarios
- Readme: improved wording
- `$.on`/`$.off`: simplified implementation, and avoiding calling the listener immediately, which is more flexible
- `$.selector`: ensuring the source function is read only once
- `$.selector`: ensuring cleanup is optimized whenever the parent is disposed, even if it's not a root
- Added a benchmark for reads
- `$.untrack`: improved performance by ~10% on average
- `$.untrack`: improved performance by ~30% on average

### Version 12.4.2
- Fixed a conflict with mangling

### Version 12.4.1
- Tests: using a more consistent delay
- `$.store._onRoots`: ensuring it throws if a non-top-level store is passed on

### Version 12.4.0
- Readme: fixed a couple of typos
- `$.store.on`: ensuring it always works with arbitrary functions
- Emitting ES2020 rather than ES2018
- `$.store`: ensuring mutations that don't actually change anything don't trigger any listeners
- `$.store._onRoots`: a new (work in progress) function for listening to changes in root properties specifically, for reacting to them very precisely
- `$.store.on`/`$.store._onRoots`: ensuring circular references are supported too

### Version 12.3.0
- `$.store`: more reliably keeping track is listening is active or not
- Removed a todo
- `$.store`: ensuring already traversed nodes are not traversed again when fiding event handlers, for better worst case scenario guarantees
- New script: all, for running all the benchmarking scripts at once
- `$.batch`: added support for functions that return a promise, which are now awaited
- `$.isBatching`: new method that tells you if currently batching or not
- `$.store`: ensuring it waits for async batching to settle first

### Version 12.2.1
- Lazy: ensuring that array pushes are not deduplicated, even if that's desirable potentially, as that's not how a push should work

### Version 12.2.0
- `$.store`: simplified listening observer detection
- Ensuring some lazy arrays and set are able to exclude cheaply some duplicated values
- Tests: grouped tests for `$.store.unwrap` on their own
- `$.store`: ensuring equivalent property descriptors set via Object.defineProperty are detected
- Readme: deleted note comparing `$.store` with createMutable, as createMutable in more recent versions actually works like `$.store`
- `$.store.on`: a new utility method for listening to changes happening inside a section of a store
- `$.store.reconcile`: a new utility method for fine-grainely updating a store with a new data object

### Version 12.1.1
- `$.untrack`: ensuring the passed function never receives the dispose function coming from the parent, if it's a root

### Version 12.1.0
- Deleted an extra semicolon
- New method: `$.boolean`, the reactive equivalent of "!!"

### Version 12.0.0

### Version 11.4.0
- Readme: minor changes
- Renamed "UNTRACKING" constant to "TRACKING"
- Observer: simplified wrap logic, simplifying untrack's implementation and avoiding traversing the prototype chain
- `$.batch`: simplified implementation, accepting always a function to batch
- `$.boolean`: slightly simplified implementation
- `$.cleanup`: simplified implementation, allowing cleanups to be registered on the superroot too
- Observer: renamed methods that read and write in the context
- `$.context`: slightly cleaned up code
- `$.get`: simplified implementation slightly
- New internal methods: isObservableFrozen, isObservableReadable, isObservableWritable
- `$.on`/`$.off`: slightly cleaned up implementation
- `$.owner`: slightly cleaner formatting
- `$.readonly`: simplified implementation
- `$.target`: simplified implementation
- `$.suspendable`: simplified slightly
- `$.if`: removed a superflous semicolon
- `$.suspended`: generalized slightly, deleting `$.suspendable`
- `$.tryCatch`: simplified implementation
- New internal method: `$.unwrap`, for unwrapping a value if it's a frozen observable
- `$.switch`: simplified implementation
- `$.selector`: optimized performance when the parent computation is disposed
- `$.selector`: minor tweaks
- `$.store`: moved unwrapping to a dedicated utility function: `$.store.unwrap`
- Minor changes
- Observer: minor tweaks and core re-organization
- Observer: ensuring post-disposal observables deduplication never takes quadratic time
- `$.memo`: fixed an issue where the equality function was called for the first execution too, which was a mistake
- Unified stale/unstale methods into a single "emit" method
- Benchmark: using 10x the number of iterations, but fewer layers
- Simplified "frozenFunction"'s signature
- `$.effect`/`$.reaction`: avoiding throwing at runtime if an async function is passed, relying instead to types
- Lazy: added some missing semicolons
- `$.memo`: deleted a no-longer-needed comment
- `$.memo`/`$.effect`/`$.reaction`: using a single number to keep track of all 3 status bits
- Observer: worked around a TS issue
- Observable: minor reorganization
- Simplified signal retrieval logic, as only roots can be signals as of today

### Version 11.3.1
- Added a comment
- Readme: fixed a typo
- Added a simple "creation" benchmark
- Significantly optimized observable creation

### Version 11.3.0
- New method: `$.owner`, for retrieving some information about the nearest owner

### Version 11.2.0
- `$.switch`: added support for a "fallback" argument, for consistency
- `$.for`/`$.forIndex`/`$.forValue`: ensuring the fallback is reused when the values change but it's still an empty array

### Version 11.1.0
- New utility: isArray
- New internal method: resolved
- `$.if`/`$.ternary`/`$.switch`: optimized creation, avoiding creating at most 2 memos per call if the when condition is static

### Version 11.0.0
- `$.for`/`$.forIndex`/`$.forValue`: ensuring the reactivity is stopped immediately when going to an empty array of values
- `$.if`: improved function signature
- `$.sample`: renamed to `$.untrack` -- SYMBOL_SAMPLED renamed to SYMBOL_UNTRACKED
- `$.computed`: renamed to `$.memo`
- Removed some internal todos

### Version 10.1.1
- Readme: fixed a typo
- `$.get`: updated type to be easier to work with for TS, this should fix some issues with that

### Version 10.1.0
- `$.for*`: simplified some code
- `$.for`: fixed a bug where cleaning up everything would also unregister roots
- New method: `$.forValue`, a potentially more advanced iterator, which unlocks more performance in some scenarios

### Version 10.0.1
- Observable type: ensuring the setter in function form takes precedence over the regular setter

### Version 10.0.0
- `$.get`: calling functions by defaults too, with an option for callign only observables
- Throwing some "Impossible" errors internally, rather than empty errors
- `$.forIndex`: pre-creating the array of results with the right size
- `$.for`/`$.forIndex`: unified some internal implementation details under a single (unexposed) `$.forAbstract`
- `$.batch`: added a comment
- Readme: updated description for `$.get`

### Version 9.2.6
- `$.store`: forbidding more properties from being reactive: `__defineGetter__`, `__defineSetter__`, `__lookupGetter__`, `__lookupSetter__`
- `$.store`: fixed an issue with SYMBOL_STORE_OBSERVABLE

### Version 9.2.5
- `$.store`: returning a readable observable rather than a writable one when requesting one with the SYMBOL_STORE_OBSERVABLE symbol, for better consistency with getters

### Version 9.2.4
- `$.store`: fixed an issue with the SYMBOL_STORE_OBSERVABLE symbol

### Version 9.2.3
- Exporting "SYMBOL_STORE" too
- `$.store`: added an hacky way to extract observables out of stores, mostly useful for internal purposes

### Version 9.2.2
- `$.store`: avoiding generating metadata for properties when that's not necessary in some cases, to save some memory

### Version 9.2.1
- Ensuring nested computations gets disposed of completely when the parent computation is disposed

### Version 9.2.0
- `$.store`: added support for Object.defineProperty
- `$.on`: returning a dispose function rather than nothing
- `$.store`: checking for special symbols when getting in constant time

### Version 9.1.1
- `$.store`: added a comment
- `$.for`: added support for arrays containing duplicates

### Version 9.1.0
- `$.selector`: widened type to allow for any function as the source, enabling support for stores
- `$.forIndex`: calling the map function with the index of the value too
- `$.for`: calling the map function with an observable to the index of the value too
- `$.get`: added a comment
- `$.for`/`$.forIndex`: ensuring mapping happens in a sample, to avoid potential unwanted suscriptions
- `$.for`/`$.forIndex`: improved support for stores, ensuring assignments at indexes are detected too
- `$.store`: simplified some code
- `$.on`: ensuring the listener is always called upon registration

### Version 9.0.1
- `$.store`: avoiding eargerly creating the properties map
- `$.store`: ignoring assignments that override Array's methods
- `$.store`: ensuring the references count is incremented and decremented properly
- `$.store`: listening on read, and making the related observables, only if the current owner could listen to them
- `$.store`: added a little benchmark
- `$.store`: avoiding handling getters and setters in arrays
- `$.store`: fixed a typo
- `$.store`: detecting non-reactive keys more efficiently

### Version 9.0.0
- Renamed `$.is` to `$.isObservable`
- New method: `$.isStore`, for checking if a value is a store or not
- `$.cleanup`: doing nothing when the current owner is the super owner
- New method: `$.store`, for deeply proxying plain objects and arrays, making them reactive

### Version 8.5.0
- `$.tryCatch`: renamed an internal variable
- `$.selector`: always returning a read-only observable
- Observable: deleted unused "is" method
- Observable: calling listeners slightly more efficiently, as that's something heavily relied upon in Voby
- Observer: added a comment
- Simplified some symbols' descriptions

### Version 8.4.3
- `$.on`/`$.off`: added support for plain Observable classes, which enable an optimization under the hood in Voby

### Version 8.4.2
- Exporting more symbols, for internal usage: SYMBOL_OBSERVABLE_FROZEN, SYMBOL_OBSERVABLE_READABLE, SYMBOL_OBSERVABLE_WRITABLE

### Version 8.4.1
- `$.selector`: avoiding caching readable observables, to enable them to get garbage collected
- Ensuring "this" is preserved for callable objects
- `$.selector`: avoiding creating a cleanup function per call

### Version 8.4.0
- `$.readonly`: avoiding leveraging a computed, which could enable some further optimizations in the future
- Added a comment
- `$.selector`: added support for returning an observable rather than a raw value

### Version 8.3.1
- Added a comment
- Avoiding using a dedicated Signal object, reusing roots for this instead

### Version 8.3.0
- Observable: added symbols for detecting the various kinds of observables: frozen/readable/writable
- Observable: added support for returning the underlying instance when called with SYMBOL_OBSERVABLE (readable/writable)
- New methods: on/off, for registering/unregistering a listener for an observable directly
- `$.readonly`: returing the same observable if it's already read-only
- Added support for using objects with a "call" method as cleanup functions, error handlers and observable listeners

### Version 8.2.1
- New symbol: SYMBOL_RESOLVE_UNWRAPPED, for forcefully skipping unwrapping in "resolve"

### Version 8.2.0
- Readme: improved section for `$.context`
- New method: `$.with`, for executing a function with a different owner

### Version 8.1.1
- `$.computed`/`$.effect`/`$.reaction`: throwing if they receive an async function, as that's most probably a mistake
- Added a comment

### Version 8.1.0
- Renamed "Reaction" to "Computation"
- New method: reaction, it's like an effect but not affected by suspense
- `$.selector`: ensuring the currently selected item is updated even inside suspense
- Ensuring a test doesn't interfere with others by registering a global error handler
- New method: forIndex, for mapping over arrays that will contain duplicates and/or primitives
- `$.suspense`: ensuring it can pause effects created inside roots
- Root: ensuring it registers itself with the owner only if it could potentially be suspended
- Root: ensuring it registers and unregisters itself with the right owner
- Observer: keeping track of roots in a lazy set
- `$.for`/`$.forIndex`: more efficiently registering roots for suspense purposes
- Observable: simplified a couple of methods, reusing lazySet* functions
- Mangled a couple extra properties

### Version 8.0.5
- `$.for`: broaded types to allow read-only arrays

### Version 8.0.4
- Renamed "S" file to "$"
- Deleted internal isArray function
- Extracted dedicated functions for manipulating lazy arrays, shrinking the bundle size by ~5%
- Observer: diffing the previous set of observables with the new one
- Observer: avoiding unregistering from disposed observables
- `$.cleanup`: ensuring it can't cause the parent observer, the one being cleaned up, to be re-executed
- Deleted a comment
- Calling methods from the "callable" object directly, for better tree-shaking, in theory
- Suspense: improved tree-shaking
- `$.batch`: slightly cleaner implementation
- Minor changes

### Version 8.0.3
- Added a smokes test about the "observable" function
- Moved teh default export to its own file, for better tree-shaking

### Version 8.0.2
- TS: set ES2018 as the target
- Published unbundled, but still mangled, for better tree-shakebility

### Version 8.0.1
- `$.suspense`: ensuring context can be read through suspense
- Added some tests

### Version 8.0.0
- Ensuring strict mode will be used for the entire library
- Added a standalone "observable" method with nothing attached to it
- Exporting all methods individually too, for better tree-shaking
- Marking the module as side-effects-free
- Deleted some unnecessary imports
- `$.selector`: ensuring internal observables inherit the abort signal available at the time when the selector was created
- `$.suspense`: rewritten to instead be a mechanism for suspending the execution of effects inside it
- `$.suspense`: using the existent observers tree, rather than keeping track of effects again
- Ensuring the abort signal of the current owner takes proprity over the abort signal of the current root
- `$.suspense`: ensuring it can handle lazily-created effects and suspenses
- `$.suspense`: added a fast path for when this method is never called
- Cached Object.is function lookup
- `$.ternary`/`$.suspense`: optimizated condition conversion to boolean
- castError: simplified implementation
- Added a comment

### Version 7.0.9
- Signal: lowered memory usage by a third

### Version 7.0.8
- Fixed an important bug where when switching from 1 dependency to 2 the first one could have been forgotten

### Version 7.0.7
- `$.effect`/`$.computed`: keeping track of the current root signal as well, optimizing some things a bit more

### Version 7.0.6
- `$.batch`: optimized batches affecting less than 2 observables
- `$.readonly`: simplified implementation
- `$.computed`: simplified implementation
- Observable: significantly optimized writes of non-fresh value for standalone observables
- Major cleanup optimization for observables created inside a root that gets disposed

### Version 7.0.5
- Package.json: updated repository url
- `$.batch`: ensuring that if multiple observables are updated whitin itself they still trigger one update of for computeds/effects, even if they listened to many of those observables

### Version 7.0.4
- `$.for`: storing mapped items in a bit less memory
- `$.selector`: storing internal observables in a bit less memory
- `$.for`: storing mapped items in a bit less memory
- Renamed an internal variable

### Version 7.0.3
- `$.resolve`: slightly optimized array resolution
- Exporting symbols too, for deeper integrations, and avoiding using computeds in `$.resolve` for sampled functions

### Version 7.0.2
- Suspense: added a test
- Observer/SuperRoot: avoiding setting the parent as undefined explicitly
- `$.computed`: freeing up some memory and returning a cheaper read-only observable if the computed can never be executed again
- `$.effect`: freeing up some memory if the effect can never possibly run again
- `$.computed`: removed support for calling the passed function with the previous result
- Updated Sinuous shim

### Version 7.0.1
- `$.effect`/`$.computed`/`$.root`: ensuring they don't override the sampling status outside of their scope

### Version 7.0.0
- Readme: updated section for `$.sample`
- `$.ternary`: reimplemented in terms of `$.switch`
- `$.batch`: added support for passing a non-function to it, which just gets returned as is, for convenience
- `$.cleanup`: improved interface
- `$.disposed`: slightly cleaner implementation
- `$.error`: improved interface
- Deleted internal "ObservableAny" type, for extra clarity in public interfaces
- `$.get`: improved public interface
- Readme: updated root's interface
- `$.selector`: slightly cleaner implementation
- `$.resolve`: rewritten to work like this: it basically just replaces each function it finds with a computed that calls that function
- `$.resolve`: added a couple of tests regarding disposal
- `$.if`/`$.ternary`/`$.switch`/`$.for`/`$.tryCatch`: updated with the new `$.resolve`
- Readme: added some notes
- New method: `$.suspense`, a generalization of `$.switch` where all cases are kept alive at the same time

### Version 6.1.0
- `$.sample`: added support for being called with non-functions and returning them unchanged, for convenience

### Version 6.0.5
- Making the "Resolved" type itself collapse to "any"

### Version 6.0.4
- Ensuring some outputted types are transformed properly
- `$.resolved`: returning "any", sadly, because returning the proper type can just trigger TS infinite loop detection down the line

### Version 6.0.3
- Observable: added a unique symbol to its type, ensuring TS can tell these apart from regular functions
- `$.resolved`: improved return type

### Version 6.0.2
- Readme: ensuring the provided types are mentioned too
- Avoiding using "null"
- `$.sample`: ensuring it doesn't turn sampling on inside nested observers too

### Version 6.0.1
- Readme: ensuring the interface for `$.batch` is mentioned too
- Tweaked some interfaces
- `$.for`: simplified caching disposition logic a bit
- `$.for`: using a proper root, which ensures errors bubble up properly
- `$.effect`/`$.computed`: ensuring they can't execute multiple times simultaneously, and delete reliance on always-incrementing internal counters

### Version 6.0.0
- `$.effect`: ensuring useless ones are unregistered from their owners too, to free up some memory
- Switched to a MobX-like algorithm
- Mangling some new properties
- Updated some dependencies
- Observable: calling computeds before effects whenever possible
- Mangling a couple extra new properties
- Observable: always forcing a refresh of the parent computed when needed, for extra safety
- Mangling a few extra properties
- Affixing some class properties, keeping the shape of the class mroe stable
- Observer: deleted "dirty" property
- Initial somewhat messy classless reorganization
- Significant cleanup
- `$.selector`: removed support for manual disposition
- Observable: avoiding exposing "dispose" and "isDisposed" APIs
- Optimized memory, though not fully
- `$.owner`: deleted, as it no longer enables the optimization I implemented it for
- Reaction: unified staleCount and staleFresh into a single number
- Minor changes
- `$.computed`: ensuring it can handle the case where its own observable is disposed before it can return
- `$.computed`: skipping updates early if its own observable got disposed
- `$.computed`: disposing of its observable when disposing of the computed itself
- `$.computed`: automatically disposing of useless ones
- `$.computed`: ensuring it disposes of its own observable when disposing of itself
- `$.selector`: optimized the edge case where a disposed observable is passed to the selector
- Worked around a type error
- Minor changes
- Observable: optimized memory usage of observables having only one observer
- Observer: optimized memory usage for array internal properties
- Made TS happy
- `$.computed`: avoiding refreshing when nothing could/should have possibly changed
- Switched to ESM
- Major reorganization, switched back to classes
- Slightly optimized build
- Updated some tests to reflect API changes
- Benchmark: added back a 5000 layers test case
- Minor changes
- Benchmark: ensuring the number of layers is always passed on as a number
- Observable: optimized memory usage somewhat
- Observer: optimized memory usage somewhat
- New method: `$.resolve`, for recursively resolving functions and arrays
- New method: `$.map`, for mapping over an array of values with good performance
- New method: `$.if`, the reactive version of the if statement
- New method: `$.ternary`, the reactive version of the native ternary operator
- New method: `$.switch`, the reactive version of the native switch statement
- `$.computed`: fixed an issue where a computed causing itself to re-execute caused an old value to be the last value set
- New method: `$.errorBoundary`, for catching errors inside a child computation
- Simplified the interface and/or implementation of some methods
- Simplified slightly the interface and/or implementation of some objects
- Cleaned up utils a bit
- Cleaned up constants a bit
- Cleaned up main export file
- Observable: deleted emit method, too much of a footgun
- Renamed ErrorBoundaryFunction to ErrorBoundaryFallbackFunction
- Renamed "comparator" to "equals"
- Observable: added support for a "false" equality function, which always causes the observable to emit even if nothing changed when setting
- New method: `$.produce`, this serves as a hook point for immer's produce basically
- Observable: renamed "select" method to "computed", for better clarity
- Ensuring readonly observables throw when they are being set
- Updated list of mangled properties
- `$.map`: replaced roots with plain observers internally, which are a bit cheaper to make
- Added a little benchmark measuring simple updates performance
- Keeping track of simulatenous iterations of effects too
- Updates benchmark: add a commented-out worst-case scenario
- Switched to a 2-way disposal algorithm, optimized for reactions observing only one and the same observable
- Observer: avoiding traversing old observers on postdispose, which was entirely useless
- Minor changes
- Observable: ensuring the produce method can be wired with immer or something else
- Effect: checking that the return value is actually a function, for extra safety
- Added some more tests
- Added some tests for `$.map`
- Renamed `$.errorBoundary` to `$.tryCatch`
- Renamed `$.map` to `$.for`
- Major cleanup: deleted `$.from`, $produce and all Observable methods, switch to a Proxy-based approach, added `$.readonly`
- Switched back to a non-Proxy approach
- `$.if`: accepting conditions of any type
- `$.ternary`: accepting conditions of any type
- `$.for`: added support for returning a fallback value for an empty array of values
- `$.batch`: renamed an internal variable for consistency
- `$.if`: added a fallback value for falsy conditions
- Observable: ensuring update functions are detected properly
- `$.if`/`$.ternary`/`$.switch`: ensuring values are resolved only once if the condition changes but the result value is the same
- Added a couple of tests
- Renamed some arguments for better clearity
- Readme: updated

### Version 5.4.0
- Avoiding registering observables with roots, as roots don't need to know about them

### Version 5.3.0
- `$.effect`: automatically disposing of useless ones again

### Version 5.2.0
- `$.root`: returning the value returned by the function passed to it

### Version 5.1.1
- `$.selector`: disposing of known observables when disposing too

### Version 5.1.0
- Readme: fixed a typo
- New method: `$.owner`, for retrieving the current owner

### Version 5.0.1
- `$.selector`: added a "dispose" method to selectors, for some extra opt-in performance
- Observer: slightly optimized self registration

### Version 5.0.0
- Updated some development dependencies
- Refined some internal types
- `$.context`: ensuring the value can be also set to undefined
- Rewritten some internals for clarity and smaller code output
- Observers: ensuring they register themselves only once
- Observer: deleted a useless function body
- Cleanup benchmark: increasing iterations by 1000, for clearer results
- Refined some internal types
- Renamed an internal variable
- Deleted "emit" method from readonly observables
- Added a Root class, for better internal clarity
- Cleanup benchmark: rewritten to be more representative of real world performane
- New Observable methods: dispose, isDisposed, which unlock some extra performance
- Observable: slightly optimized emission
- Removed an old comment
- Targeting ES2018
- Turned mangling back on

### Version 4.4.3
- Observable: avoiding deleting observers immediately as long as they get disposed, marking instead observers themselves as deleted

### Version 4.4.2
- Added a cleanup benchmark script
- `$.selector`: avoiding scheduling microtasks on cleanup, as that probably ends up being more expensive
- `$.selector`: registering cleanups slightly more efficiently
- `$.effect`: avoiding automatically disposing of useless effects, trading some memory for some more performance
- Cleanup script: ensuring the selector is actually being used
- `$.selector`: delete all internal observables at once on cleanup
- Inlined all isUndefined calls
- Inlined all isFunction calls
- Inlined all isMap calls

### Version 4.4.1
- Readme: updated `$.effect` description
- Observable: removed an unnecessary function call when setting a value
- Effect: fixed a bug where potential sets where treated like potential arrays
- Avoiding unregistering observers from observers, as a (hopefully not to risky) optimization
- Batch: ensuring a default value of the "active" property is set
- Benchmark: added a 500000 run
- Benchmark: renamed a variable
- Observable: soft-deleting observers and deleting them at emission time, as a performance optimization

### Version 4.4.0
- New method: `$.selector`, for massively optimizing isSelected-kind computations
- `$.from`: avoiding wrapping the effect, creating it directly

### Version 4.3.0
- New Observable method: emit
- Test: checking for readable and writable observables more strictly

### Version 4.2.0
- New observable method: select

### Version 4.1.0
- New Observable methods: readonly, isReadonly

### Version 4.0.1
- `$.error`: added a test about errors being thrown if triggered inside the error handler
- `$.error`: added tests about errors being thrown if triggered inside the error handler inside effects or roots
- `$.computed`: changed return type to not account for edge cases undefined, for convenience

### Version 4.0.0
- Cleaned up some types
- `$.get`: avoiding resolving observables recursively, as that's largely unnecessary and it can't be typed properly
- Observable: removed "on" method
- Ensuring that proper readable or writable observables are returned, and generating them better
- Observable: optimized emission when the set contains only one observer
- Observer: cleaning up properties in a more efficient way
- Owner: replaced a forEach with a for loop
- Owner: optimized observable registration, skipping the `has` check

### Version 3.1.5
- Owner: deleted wrapVoid function
- Owner: deleted wrapWithout function
- Effect/computed: avoiding triggering an unsubscription during the first execution
- Computed: accessing the observable value directly, bypassing the "sample" function

### Version 3.1.4
- Optimized some generated anonymous functions
- Soft deleting by setting properties to undefined instead of using "delete", avoiding changing the underlying hidden class

### Version 3.1.3
- Disabled mangling, for much better debuggability

### Version 3.1.2
- Replaced benchmark with a reimplementation of the cellx benchmark
- Observer: keeping observers in a Set rather than an Array for better performance guarantees
- Deleting some keys instead of setting to undefined
- Avoiding creating a temporary array when making a new Set

### Version 3.1.1
- `$.effect`: ensuring the proper return type is returned

### Version 3.1.0
- `$.effect`: returning a disposer function

### Version 3.0.0
- Renamed Context to Owner
- Added a "context" function
- Exporting some types for observables
- Added a little benchmark suite
- Ensuring that the context is cleared up when disposing of observers
- Various mostly cosmetic changes
- Targeting es2015, bundling and mangling
- `$.context`: changed API to allow for overriding outer contexts

### Version 2.4.0
- Ensuring that sampling doesn't leak computeds or effects
- Renamed "update" to "produce"
- Added a simpler "update" method, which doesn't involve any cloning

### Version 2.3.1
- `$.effect`: minor optimization when a cleanup function is returned

### Version 2.3.0
- New method: `$.disposed`, for easily keeping track of whether the parent computation got disposed or not

### Version 2.2.1
- Improved some types

### Version 2.2.0
- get: getting recursively if possible

### Version 2.1.2
- `$.computed`: returning a read-only observable, at least as a type-level constrain
- "on" method: returning a read-only observable, at least as a type-level constrain

### Version 2.1.1
- Ensuring errors bubble up

### Version 2.1.0
- Added a comment
- New method: `$.error`, for registering an error handler

### Version 2.0.3
- Automatically disposing of effects if they have no reactivity whatsoever

### Version 2.0.2
- Avoiding using optional chaining

### Version 2.0.1
- Readme: added a little table of contents
- New method: `$.get`, for getting the value out of an observable or a non-observable alike
- Ensuring typed functions are exposed

### Version 2.0.0
- Completely rewritten to work more like S, meaning now it's super powerful and much better tested

### Version 1.6.1
- Importing only the necessary methods from "path-prop"

### Version 1.6.0
- New "batch" library method for preventing listeners from being called while inside it, and calling them only once after the batch

### Version 1.5.0
- New emit observable method: for calling listeners manually
- Added an "update" observable method for updating the value at a path conveniently

### Version 1.4.0
- Swithced back to Sets for storing listeners, for much better runtime performance
- Computed method: ensuring the function gets always passed the value of the parent observable
- Computed method: added support for manually listing additional dependencies

### Version 1.3.3
- Massively optimized memory usage by switching to a Proxy to make classes callable
- From: avoiding calling a noop cleanup function unnecessarily
- Updated todos
- is: improved check
- Observable: updated call method's type

### Version 1.3.2
- Readme: fixed a typo
- is: ensuring it also recognizes instances of the Observable class
- Observable: marked the call method as private
- Observable: avoiding setting a noop disposer at all
- Avoiding using for..of loops
- Observable: making the "computed" class method return another class
- Observable: more cleanly separated private and public methods
- Observable: using an array instead of a set for storing the listeners, for better memory usage
- Observable: avoiding creating the listeners array if not needed
- Context: using arrays instead of sets for storing links
- Context: using an array instead of a set for storing listeners

### Version 1.3.1
- Made creating a new observable ~30x faster

### Version 1.3.0
- New observable method: computed

### Version 1.2.1
- Ensuring the sample method is listed in the types

### Version 1.2.0
- Added some todos
- New observable method: sample

### Version 1.1.0
- Initial commit
- Computed: added support for stopping the reactivity by calling #dispose on the observable
