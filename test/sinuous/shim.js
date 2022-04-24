
import $ from '../../dist/index.js';

const equals = () => false;

const observable = value => {
  return $ ( value, { equals } );
};

const computed = ( fn, value ) => {
  const observable = $.computed ( fn, value, { equals } );
  return () => observable.get ();
};

const subscribe = fn => {
  const dispose = $.root ( dispose => {
    $.computed ( fn, undefined, { equals } );
    return dispose;
  });
  $.cleanup ( dispose );
  fn._dispose = dispose;
  return () => dispose ();
};

const unsubscribe = fn => {
  fn._dispose ();
};

const o = observable;
const S = computed;
const root = $.root;
const transaction = $.batch;
const sample = $.sample;
const cleanup = $.cleanup;

export {o, S, root, sample, transaction, observable, computed, cleanup, subscribe, unsubscribe};