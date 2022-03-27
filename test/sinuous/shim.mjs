
import oby from '../../dist/index.js';
import Computed from '../../dist/computed.js';
import Observer from '../../dist/observer.js';

const comparator = () => false;

const observable = value => {
  return oby.default ( value, { comparator } );
};

const computed = ( fn, value ) => {
  const observable = oby.default.computed ( fn, value, { comparator } );
  return () => observable.get ();
};

const subscribe = fn => {
  fn._computed = new Computed.default ( fn, undefined, { comparator } );
  return () => unsubscribe ( fn );
};

const unsubscribe = fn => {
  fn._computed.dispose ();
};

const o = observable;
const S = computed;
const root = oby.default.root;
const transaction = oby.default.batch;
const sample = oby.default.sample;
const cleanup = oby.default.cleanup;

export {o, S, root, sample, transaction, observable, computed, cleanup, subscribe, unsubscribe};
