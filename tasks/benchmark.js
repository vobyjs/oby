
/* IMPORT */

const {default: $} = require ( '../dist' );
const benchmark = require ( 'benchloop' );

/* MAIN */

benchmark.defaultOptions = Object.assign ( benchmark.defaultOptions, {
  log: 'compact'
});

benchmark ({
  name: 'new.observable',
  iterations: 100000,
  fn: () => {
    $(123);
  }
});

benchmark ({
  name: 'new.effect',
  iterations: 100000,
  fn: () => {
    $.effect ( () => {} );
  }
});

benchmark ({
  name: 'new.computed',
  iterations: 100000,
  fn: () => {
    $.computed ( () => {} );
  }
});

benchmark ({
  name: 'new.root',
  iterations: 100000,
  fn: () => {
    $.root ( () => {} );
  }
});

benchmark ({
  name: 'new.deep',
  iterations: 100000,
  fn: () => {
    $.root ( () => {
      $.effect ( () => {
        $.root ( () => {
          $.computed ( () => {
            $(123);
          })
        });
      });
    });
  }
});

const o = $(-1);

benchmark ({
  name: 'update.observable',
  iterations: 100000,
  fn: () => {
    o ( Math.random () );
  }
});

benchmark.summary ();
