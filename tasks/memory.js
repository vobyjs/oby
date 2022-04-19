
/* IMPORT */

import $ from '../dist/index.js';

/* MAIN */

const observables = [];

console.time ( 'create' );

$.root ( () => {
  for ( let i = 0, l = 50000; i < l; i++ ) {
    // $.effect ( () => { // Effect, should be more memory efficient as it returns nothing
    $.computed ( () => { // Computed, should be less memory efficient as it returns an observable
      const observable = $( Math.random () );
      observables.push ( observable );
      observable ();
    });
  }
});

console.timeEnd ( 'create' );

global.observables = observables;

console.log ( process.memoryUsage ().heapUsed );

debugger;
