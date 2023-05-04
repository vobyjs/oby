
/* IMPORT */

import $ from '../dist/index.js';

/* MAIN */

console.time ( 'total' );

// $.effect ( () => {
// $.untrack ( () => {

for ( let i = 0; i < 3; i++ ) {

  console.time ( 'primitive condition + primitive value (true)' );
  for ( let i = 0; i < 10_000; i++ ) {
    $.if ( true, 1, 2 );
  }
  console.timeEnd ( 'primitive condition + primitive value (true)' );

  console.time ( 'primitive condition + primitive value (false)' );
  for ( let i = 0; i < 10_000; i++ ) {
    $.if ( false, 1, 2 );
  }
  console.timeEnd ( 'primitive condition + primitive value (false)' );

  console.time ( 'primitive condition + function value (true)' );
  for ( let i = 0; i < 10_000; i++ ) {
    $.if ( true, () => 1, () => 2 )();
  }
  console.timeEnd ( 'primitive condition + function value (true)' );

  console.time ( 'primitive condition + function value (false)' );
  for ( let i = 0; i < 10_000; i++ ) {
    $.if ( false, () => 1, () => 2 )();
  }
  console.timeEnd ( 'primitive condition + function value (false)' );

  console.time ( 'function condition + primitive value (true)' );
  for ( let i = 0; i < 10_000; i++ ) {
    $.if ( () => true, 1, 2 )();
  }
  console.timeEnd ( 'function condition + primitive value (true)' );

  console.time ( 'function condition + primitive value (false)' );
  for ( let i = 0; i < 10_000; i++ ) {
    $.if ( () => false, 1, 2 )();
  }
  console.timeEnd ( 'function condition + primitive value (false)' );

  console.time ( 'function condition + function value (true)' );
  for ( let i = 0; i < 10_000; i++ ) {
    $.if ( () => true, () => 1, () => 2 )();
  }
  console.timeEnd ( 'function condition + function value (true)' );

  console.time ( 'function condition + function value (false)' );
  for ( let i = 0; i < 10_000; i++ ) {
    $.if ( () => false, () => 1, () => 2 )();
  }
  console.timeEnd ( 'function condition + function value (false)' );

}

// });
// }, { sync: true } );

console.timeEnd ( 'total' );
