// const {default: oby} = require ( './dist' );
const {default: Observable} = require ( './dist/observable' );

global.observables = [];

console.time('x');
for ( let i = 0, l = 50000; i < l; i++ ) {
  // global.observables.push ( oby ( Math.random () ) );
  // global.observables.push ( oby () );
  global.observables.push ( new Observable ( Math.random () ) );
}
console.timeEnd('x');

debugger;
