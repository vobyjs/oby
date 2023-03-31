
/* IMPORT */

import $ from '../dist/index.js';

/* MAIN */

console.time ( 'creation.total' );

for ( const listeners of [0, 1, 2, 3, 4, 5] ) {

  console.time ( `create.${listeners}` );

  const arr = new Array ( 1_000_000 );

  for ( let i = 0, l = 1_000_000; i < l; i++ ) {
    arr[i] = $();
  }

  for ( let i = 0; i < listeners; i++ ) {

    $.effect ( () => {
      for ( let i = 0, l = 1_000_000; i < l; i++ ) {
        arr[i]();
      }
    }, { sync: true } );

  }

  console.timeEnd ( `create.${listeners}` );

}

console.timeEnd ( 'creation.total' );
