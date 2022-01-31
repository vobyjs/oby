
/* IMPORT */

import Batch from './batch';
import Computed from './computed';
import Context from './context';
import Effect from './effect';
import from from './from';
import is from './is';
import Observable from './observable';

/* MAIN */

const observable = Observable.wrap.bind ( Observable );

observable.batch = Batch.wrap;
observable.cleanup = Context.registerCleanup;
observable.computed = Computed.wrap;
observable.effect = Effect.wrap;
observable.from = from;
observable.is = is;
observable.root = Context.wrapVoid;
observable.sample = Context.wrapWithout;

/* EXPORT */

export default observable;
