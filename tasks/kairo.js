
/* IMPORT */

import $ from '../dist/index.js';

/* MAIN */

const avoidablePropagation = () => {

  const head = $(0);
  const memo1 = $.memo ( () => head () );
  const memo2 = $.memo ( () => Math.min ( 0, memo1 () ) );
  const memo3 = $.memo ( () => memo2 () + 1 );
  const memo4 = $.memo ( () => memo3 () + 2 );
  const memo5 = $.memo ( () => memo4 () + 3 );

  $.effect ( memo5 );

  head ( 1 );
  $.tick ();

  console.assert ( memo5 () === 6 );
  for ( let i = 0; i < 1_000; i++ ) {
    head ( i );
    $.tick ();
    console.assert ( memo5 () === 6 );
  }

};

/* RUNNING */

console.time ( 'avoidablePropagation' );
for ( let i = 0; i < 1000; i++ ) {
  avoidablePropagation ();
}
console.timeEnd ( 'avoidablePropagation' );
