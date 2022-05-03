
import $ from '../../dist/index.js';

const equals = () => false;

const observable = value => {
  return $ ( value, { equals } );
};

const computed = ( fn, value ) => {
  let prev = value;
  const observable = $.computed ( () => prev = fn ( prev ), { equals } );
  return () => observable ();
};

const subscribe = fn => {
  const dispose = $.root ( dispose => {
    let prev = undefined;
    $.computed ( () => prev = fn ( prev ), { equals } );
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
