
/* IMPORT */

import $ from '../dist/index.js';

/* HELPERS */

const symbol = Symbol ();
const wrap = fn => $.effect ( fn, { sync: true } );

/* MAIN */

wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () =>
wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () =>
wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () =>
wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () =>
wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () =>
wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () =>
wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () =>
wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () =>
wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () =>
wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () => wrap ( () =>
  {
    console.time ( 'lookup' );
    for ( let i = 0, l = 1_000_000; i < l; i++ ) {
      wrap ( () => {
        $.context ( symbol );
      });
    }
    console.timeEnd ( 'lookup' );
  }
))))))))))
))))))))))
))))))))))
))))))))))
))))))))))
))))))))))
))))))))))
))))))))))
))))))))))
))))))))))
