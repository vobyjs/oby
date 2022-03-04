
/* IMPORT */

const {default: $} = require ( '../dist' );

/* MAIN */

// The following is an implementation of the cellx benchmark https://codesandbox.io/s/cellx-bench-forked-s6kusj

const cellx = layers => {

  return new Promise ( resolve => {

    $.root ( () => {

      const start = {
        prop1: $(1),
        prop2: $(2),
        prop3: $(3),
        prop4: $(4)
      };

      let layer = start;

      for ( let i = layers; i > 0; i-- ) {

        layer = (m => {

          const s = {
            prop1: $.computed ( () => {
              return m.prop2 ();
            }),
            prop2: $.computed ( () => {
              return m.prop1 () - m.prop3 ();
            }),
            prop3: $.computed ( () => {
              return m.prop2 () + m.prop4 ();
            }),
            prop4: $.computed ( () => {
              return m.prop3 ();
            })
          };

          $.computed ( s.prop1.get );
          $.computed ( s.prop2.get );
          $.computed ( s.prop3.get );
          $.computed ( s.prop4.get );

          s.prop1 ();
          s.prop2 ();
          s.prop3 ();
          s.prop4 ();

          return s;

        })( layer );

      }

      const startTime = performance.now ();

      start.prop1 ( 4 );
      start.prop2 ( 3 );
      start.prop3 ( 2 );
      start.prop4 ( 1 );

      const endTime = performance.now ();
      const elapsedTime = endTime - startTime;

      resolve ( elapsedTime );

    });

  });

};

const benchmark = async () => {

  let total = 0;

  for ( const runs of [10, 20, 30, 50, 100, 1000, 5000, 10000] ) {

    const elapsed = await cellx ( runs );

    console.log ( `Runs ${runs}: ${elapsed}` );

    total += elapsed;

  }

  console.log ( `Total: ${total}` );

};

benchmark ();
