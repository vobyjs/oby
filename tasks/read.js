
/* IMPORT */

import benchmark from 'benchloop';
import $ from '../dist/index.js';

/* MAIN */

const o = $(0);
const ro = $.memo ( o );
const fo = $.memo ( () => 0 );
const fn = () => o ();

benchmark.defaultOptions = Object.assign ( benchmark.defaultOptions, {
  iterations: 1,
  log: 'compact'
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
      for ( let i = 0, l = 2_000_000; i < l; i++ ) {
        $.untrack ( o );
      }
    }
  });

  benchmark ({
    name: 'ro',
    fn: () => {
      for ( let i = 0, l = 2_000_000; i < l; i++ ) {
        $.untrack ( ro );
      }
    }
  });

  benchmark ({
    name: 'fo',
    fn: () => {
      for ( let i = 0, l = 2_000_000; i < l; i++ ) {
        $.untrack ( fo );
      }
    }
  });

  benchmark ({
    name: 'fn',
    fn: () => {
      for ( let i = 0, l = 2_000_000; i < l; i++ ) {
        $.untrack ( fn );
      }
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
