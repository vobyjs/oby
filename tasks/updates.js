
/* IMPORT */

import $ from '../dist/index.js';

/* MAIN */

console.time ( 'create' );

const o = $(0);

for ( let i = 0, l = 100000; i < l; i++ ) {
  $.computed ( () => {
    o ();
  });
}

console.timeEnd ( 'create' );

console.time ( 'updates' );

for ( let i = 1, l = 100; i < l; i++ ) {
  o ( i );
}

console.timeEnd ( 'updates' );

console.log ( process.memoryUsage ().heapUsed );

debugger;
