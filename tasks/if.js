
/* IMPORT */

import $ from '../dist/index.js';

/* HELPERS */

const $true = $(true);
const $false = $(false);

const $frozenTrue = $.memo ( () => true );
const $frozenFalse = $.memo ( () => false );

/* MAIN */

console.time ( 'total' );

// $.effect ( () => {
// $.untrack ( () => {

console.time ( 'primitive' );
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

}
console.timeEnd ( 'primitive' );

console.time ( 'function' );
for ( let i = 0; i < 3; i++ ) {

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
console.timeEnd ( 'function' );

console.time ( 'observable.writable' );
for ( let i = 0; i < 3; i++ ) {

  console.time ( 'observable condition + primitive value (true)' );
  for ( let i = 0; i < 10_000; i++ ) {
    $.if ( $true, 1, 2 )();
  }
  console.timeEnd ( 'observable condition + primitive value (true)' );

  console.time ( 'observable condition + primitive value (false)' );
  for ( let i = 0; i < 10_000; i++ ) {
    $.if ( $false, 1, 2 )();
  }
  console.timeEnd ( 'observable condition + primitive value (false)' );

  console.time ( 'observable condition + function value (true)' );
  for ( let i = 0; i < 10_000; i++ ) {
    $.if ( $true, () => 1, () => 2 )();
  }
  console.timeEnd ( 'observable condition + function value (true)' );

  console.time ( 'observable condition + function value (false)' );
  for ( let i = 0; i < 10_000; i++ ) {
    $.if ( $false, () => 1, () => 2 )();
  }
  console.timeEnd ( 'observable condition + function value (false)' );

}
console.timeEnd ( 'observable.writable' );

console.time ( 'observable.frozen' );
for ( let i = 0; i < 3; i++ ) {

  console.time ( 'observable condition + primitive value (true)' );
  for ( let i = 0; i < 10_000; i++ ) {
    $.if ( $frozenTrue, 1, 2 )();
  }
  console.timeEnd ( 'observable condition + primitive value (true)' );

  console.time ( 'observable condition + primitive value (false)' );
  for ( let i = 0; i < 10_000; i++ ) {
    $.if ( $frozenFalse, 1, 2 )();
  }
  console.timeEnd ( 'observable condition + primitive value (false)' );

  console.time ( 'observable condition + function value (true)' );
  for ( let i = 0; i < 10_000; i++ ) {
    $.if ( $frozenTrue, () => 1, () => 2 )();
  }
  console.timeEnd ( 'observable condition + function value (true)' );

  console.time ( 'observable condition + function value (false)' );
  for ( let i = 0; i < 10_000; i++ ) {
    $.if ( $frozenFalse, () => 1, () => 2 )();
  }
  console.timeEnd ( 'observable condition + function value (false)' );

}
console.timeEnd ( 'observable.frozen' );

// });
// }, { sync: true } );

console.timeEnd ( 'total' );
