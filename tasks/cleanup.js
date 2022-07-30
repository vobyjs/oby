
/* IMPORT */

import $ from '../dist/index.js';

/* MAIN */

const selected = $();
const isSelected = $.selector ( selected );
const isSelectedDisposed = $.selector ( $.memo ( () => {} ) );

$.root ( dispose => {

  console.time ( 'create' );

  const global = $();

  const memoVoid = $.memo ( () => {} );

  const items = [];

  for ( let i = 0, l = 1000000; i < l; i++ ) {

    items.push ( $() );

  }

  const disposers = [];

  for ( let i = 0, l = 1000000; i < l; i++ ) {

    $.root ( dispose => {

      global ();

      disposers.push ( dispose );

      const memo = $.memo ( () => {
        global ();
        items[i]();
        isSelected ( i );
        isSelectedDisposed ( i );
      });

      $.effect ( () => {
        global ();
        items[i]();
        memo ();
        memoVoid ();
      });

      $.effect ( () => {
        global ();
        items[i]();
        memo ();
        memoVoid ();
      });

    });

  }

  console.timeEnd ( 'create' );

  console.time ( 'cleanup' );

  dispose ();

  disposers.forEach ( dispose => dispose () );

  console.timeEnd ( 'cleanup' );

});

debugger;
