
/* IMPORT */

import $ from '../dist/index.js';

/* MAIN */

const selected = $();
const isSelected = $.selector ( selected );
const isSelectedDisposed = $.selector ( $.memo ( () => {} ) );

$.root ( dispose => {

  console.time ( 'create' );

  const isSelected2 = $.selector ( selected );
  const isSelectedDisposed2 = $.selector ( $.memo ( () => {} ) );

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
        isSelected2 ( i );
        isSelectedDisposed ( i );
        isSelectedDisposed2 ( i );
      });

      $.effect ( () => {
        global ();
        items[i]();
        memo ();
        memoVoid ();
      }, { sync: true } );

      $.effect ( () => {
        global ();
        items[i]();
        memo ();
        memoVoid ();
      }, { sync: true } );

    });

  }

  console.timeEnd ( 'create' );

  console.time ( 'cleanup' );

  dispose ();

  disposers.forEach ( dispose => dispose () );

  console.timeEnd ( 'cleanup' );

});

debugger;
