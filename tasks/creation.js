
/* IMPORT */

import $ from '../dist/index.js';

/* MAIN */

console.time ( 'create' );

for ( let i = 0, l = 10_000_000; i < l; i++ ) {

  $();

}

console.timeEnd ( 'create' );
