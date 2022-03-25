
/* IMPORT */

const {default: $} = require ( '../dist' );

/* MAIN */

const o = $(-1);

$.root ( dispose => {

  const isSelected = $.selector ( o );

  const disposers = [];

  for ( let i = 0, l = 1000; i < l; i++ ) {

    $.root ( dispose => {

      disposers.push ( dispose );

      $.effect ( () => {
        o ();
        isSelected ( i );
      });

      $.effect ( () => {
        o ();
      });

      $.effect ( () => {
        o ();
      });

    });

  }

  console.time ( 'cleanup' );

  dispose ();

  disposers.forEach ( dispose => dispose () );

  console.timeEnd ( 'cleanup' );

});

debugger;
