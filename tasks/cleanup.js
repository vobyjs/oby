
/* IMPORT */

const {default: $} = require ( '../dist' );

/* MAIN */

$.root ( dispose => {

  console.time ( 'create' );

  const global = $();

  const items = [];

  for ( let i = 0, l = 1000000; i < l; i++ ) {

    items.push ( $() );

  }

  const selected = $();
  const isSelected = $.selector ( selected );

  const disposers = [];

  for ( let i = 0, l = 1000000; i < l; i++ ) {

    $.root ( dispose => {

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

  dispose ();

  disposers.forEach ( dispose => dispose () );

  console.timeEnd ( 'cleanup' );

});

debugger;
