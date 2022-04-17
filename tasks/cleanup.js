
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

      const computed = $.computed ( () => {
        global ();
        items[i]();
        isSelected ( i );
      });

      $.effect ( () => {
        global ();
        items[i]();
        computed ();
      });

      $.effect ( () => {
        global ();
        items[i]();
        computed ();
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
