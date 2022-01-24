
/* IMPORT */

const {default: oby, default: observable} = require ( '../dist' );
const {default: Observable} = require ( '../dist/observable' );

/* MAIN */

const observables = [];

console.time ( 'create' );

for ( let i = 0, l = 50000; i < l; i++ ) {

  const observable = oby ( Math.random () ); // Callable
  // const observable = new Observable ( Math.random () ); // Class-only

  observables.push ( observable );

}

console.timeEnd ( 'create' );

global.observables = observables;

console.log ( process.memoryUsage ().heapUsed );

debugger;
