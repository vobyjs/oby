
/* IMPORT */

import benchmark from 'benchloop';
import $ from '../dist/index.js';

/* MAIN */

const o = $(0);
const ro = $.memo ( o );
const fo = $.memo ( () => 0 );
const fn = () => o ();

benchmark.config ({
  iterations: 1
});

benchmark.group ( 'regular', () => {

  benchmark ({
    name: 'o',
    fn: () => {
      for ( let i = 0, l = 2_000_000; i < l; i++ ) {
        o ();
      }
    }
  });

  benchmark ({
    name: 'ro',
    fn: () => {
      for ( let i = 0, l = 2_000_000; i < l; i++ ) {
        ro ();
      }
    }
  });

  benchmark ({
    name: 'fo',
    fn: () => {
      for ( let i = 0, l = 2_000_000; i < l; i++ ) {
        fo ();
      }
    }
  });

  benchmark ({
    name: 'fn',
    fn: () => {
      for ( let i = 0, l = 2_000_000; i < l; i++ ) {
        fn ();
      }
    }
  });

});

benchmark.group ( 'untrack', () => {

  benchmark ({
    name: 'o',
    fn: () => {
      $.effect ( () => {
        for ( let i = 0, l = 2_000_000; i < l; i++ ) {
          $.untrack ( o );
        }
      }, { sync: true } );
    }
  });

  benchmark ({
    name: 'ro',
    fn: () => {
      $.effect ( () => {
        for ( let i = 0, l = 2_000_000; i < l; i++ ) {
          $.untrack ( ro );
        }
      }, { sync: true } );
    }
  });

  benchmark ({
    name: 'fo',
    fn: () => {
      $.effect ( () => {
        for ( let i = 0, l = 2_000_000; i < l; i++ ) {
          $.untrack ( fo );
        }
      }, { sync: true } );
    }
  });

  benchmark ({
    name: 'fn',
    fn: () => {
      $.effect ( () => {
        for ( let i = 0, l = 2_000_000; i < l; i++ ) {
          $.untrack ( fn );
        }
      }, { sync: true } );
    }
  });

});

benchmark.group ( 'untracked', () => {

  benchmark ({
    name: 'o',
    fn: () => {
      $.untrack ( () => {
        for ( let i = 0, l = 2_000_000; i < l; i++ ) {
          $.untrack ( o );
        }
      });
    }
  });

  benchmark ({
    name: 'ro',
    fn: () => {
      $.untrack ( () => {
        for ( let i = 0, l = 2_000_000; i < l; i++ ) {
          $.untrack ( ro );
        }
      });
    }
  });

  benchmark ({
    name: 'fo',
    fn: () => {
      $.untrack ( () => {
        for ( let i = 0, l = 2_000_000; i < l; i++ ) {
          $.untrack ( fo );
        }
      });
    }
  });

  benchmark ({
    name: 'fn',
    fn: () => {
      $.untrack ( () => {
        for ( let i = 0, l = 2_000_000; i < l; i++ ) {
          $.untrack ( fn );
        }
      });
    }
  });

});

benchmark.summary ();
