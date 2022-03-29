
/* IMPORT */

const {default: $} = require ( '../dist' );

/* MAIN */

const selected = $();
const isSelected = $.selector ( selected );

$.root ( dispose => {

  console.time ( 'create' );

  const global = $();

  const items = [];

  for ( let i = 0, l = 1000000; i < l; i++ ) {

    items.push ( $() );

  }

  const disposers = [];

  for ( let i = 0, l = 1000000; i < l; i++ ) {

    $.root ( dispose => {

      global ();

      disposers.push ( dispose );

      $.effect ( () => {
        global ();
        items[i]();
        isSelected ( i );
      });

      $.effect ( () => {
        global ();
        items[i]();
      });

      $.effect ( () => {
        global ();
        items[i]();
      });

    });

  }

  console.timeEnd ( 'create' );

  console.time ( 'cleanup' );

  global.dispose ();
  selected.dispose ();
  isSelected.dispose ();
  items.forEach ( item => item.dispose () );

  dispose ();

  disposers.forEach ( dispose => dispose () );

  console.timeEnd ( 'cleanup' );

});

debugger;
