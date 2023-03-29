
/* IMPORT */

import $ from '../dist/index.js';

/* MAIN */

const arr = new Array ( 1_000_000 ).fill ( 0 ).map ( () => ({}) );

console.time ( 'creation' );

for ( let i = 0, l = arr.length; i < l; i++ ) {
  $.store ( arr[i] );
}

console.timeEnd ( 'creation' );
