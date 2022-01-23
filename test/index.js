
/* IMPORT */

const {default: spy} = require ( 'call-spy' );
const {describe} = require ( 'fava' );
const {default: oby} = require ( '../dist' );
const {default: Observable} = require ( '../dist/observable' );

/* MAIN */

describe ( 'oby', () => {

  describe ( 'observable', it => {

    it ( 'is both a getter and a setter', t => {

      const o = oby ();

      t.is ( o (), undefined );

      o ( 123 );

      t.is ( o (), 123 );

      o ( 321 );

      t.is ( o (), 321 );

      o ( undefined );

      t.is ( o (), undefined );

    });

    it ( 'has a "get" method, for getting', t => {

      const o = oby ( 123 );

      t.is ( o.get (), 123 );

    });

    it ( 'has a "sample" method, for getting', t => {

      const o = oby ( 123 );

      t.is ( o.sample (), 123 );

    });

    it ( 'has a "set" method, for setting', t => {

      const o = oby ();

      o.set ( 123 );

      t.is ( o (), 123 );

      const noop1 = () => {};

      o.set ( noop1 );

      t.is ( o (), noop1 );

      const noop2 = () => {};

      o.set ( noop2 );

      t.is ( o (), noop2 );

    });

    it ( 'has an "on" method, for subscribing', t => {

      const valueOld = {};
      const valueNew = {};

      const [fn, result] = spy ( () => {} );

      const o = oby ( valueOld );

      o.on ( fn );

      o ( valueNew );

      t.is ( result.calls, 1 );
      t.deepEqual ( result.arguments, [valueNew, valueOld] );

    });

    it ( 'has an "off" method, for unsubscribing', t => {

      const valueOld = {};
      const valueNew = {};

      const [fn, result] = spy ( () => {} );

      const o = oby ( valueOld );

      o.on ( fn );
      o.off ( fn );

      o ( valueNew );

      t.is ( result.calls, 0 );

    });

    it ( 'has a "computed" method, for making an observable out of the current observable ', t => {

      const o = oby ( 5 );
      const double = o.computed ( value => value * value );

      t.is ( double (), 25 );

      o ( 10 );

      t.is ( double (), 100 );

      double.dispose ();

      o ( 100 );

      t.is ( double (), 100 );

    });

    it ( 'has a "dispose" method, for cleaning up', t => {

      const o = oby ();

      o.dispose ();

      t.pass ();

    });

    it ( 'supports an initial value', t => {

      const o = oby ( 123 );

      t.is ( o (), 123 );

    });

    it ( 'supports an initial disposer function', t => {

      const [fn, result] = spy ( () => {} );

      const o = oby ( 1, fn );

      t.is ( result.calls, 0 );

      o.dispose ();

      t.is ( result.calls, 1 );

      o.dispose ();
      o.dispose ();
      o.dispose ();

      t.is ( result.calls, 1 );

    });

    it ( 'supports function setters', t => {

      const o = oby ( 1 );

      o ( prev => prev + 1 );

      t.is ( o (), 2 );

    });

    it ( 'supports ignoring setters that do not change the value', t => {

      const o = oby ( 1 );
      const [fn, result] = spy ( () => {} );
      let calls = 0;

      o.on ( fn );

      const filteredValues = [0, -0, Infinity, NaN, 'foo', true, false, {}, [], Promise.resolve (), new Map (), new Set (), null, undefined, () => {}, Symbol ()];

      for ( const value of filteredValues ) {

        o.set ( value );

        t.is ( result.calls, calls += 1 );

        o.set ( value );

        t.is ( result.calls, calls );

        o ( () => value );

        t.is ( result.calls, calls );

      }

    });

    it ( 'supports subscribing immediately', t => {

      const valueOld = {};
      const valueNew = {};

      const [fn, result] = spy ( () => {} );

      const o = oby ( valueOld );

      o.on ( fn, true );

      t.is ( result.calls, 1 );
      t.deepEqual ( result.arguments, [valueOld, undefined] );

      o ( valueNew );

      t.is ( result.calls, 2 );
      t.deepEqual ( result.arguments, [valueNew, valueOld] );

    });

    it ( 'supports self-unsubscribing subscribers', t => {

      const o = oby ();

      const [fn1, result1] = spy ( () => o.off ( fn1 ) );
      const [fn2, result2] = spy ( () => {} );

      o.on ( fn1 );
      o.on ( fn2 );

      o ( 123 );

      t.is ( result1.calls, 1 );
      t.is ( result2.calls, 1 );

      o ( 456 );

      t.is ( result1.calls, 1 );
      t.is ( result2.calls, 2 );

    });

    it ( 'supports filtering out duplicated subscriptions', t => {

      const valueOld = {};
      const valueNew = {};

      const [fn, result] = spy ( () => {} );

      const o = oby ( valueOld );

      o.on ( fn );
      o.on ( fn );
      o.on ( fn );

      o ( valueNew );

      t.is ( result.calls, 1 );
      t.deepEqual ( result.arguments, [valueNew, valueOld] );

    });

  });

  describe ( 'computed', it => {

    it ( 'makes an observable with the return of the function', t => {

      const a = oby ( 1 );
      const b = oby ( 2 );
      const c = oby.computed ( () => a () + b () );

      t.true ( oby.is ( c ) );
      t.is ( c (), 3 );

    });

    it ( 'updates the observable when the dependencies change', t => {

      const a = oby ( 1 );
      const b = oby ( 2 );
      const c = oby.computed ( () => a () + b () );

      a ( 3 );
      b ( 7 );

      t.is ( c (), 10 );

    });

    it ( 'does not update the observable if potential dependencies are only sampled', t => {

      const a = oby ( 1 );
      const b = oby ( 2 );
      const c = oby.computed ( () => a.sample () + b.sample () );

      t.is ( c (), 3 );

      a ( 3 );
      b ( 7 );

      t.is ( c (), 3 );

    });

    it ( 'supports disposing of it', t => {

      const a = oby ( 1 );
      const b = oby ( 2 );
      const c = oby.computed ( () => a () + b () );

      c.dispose ();

      a ( 3 );
      b ( 7 );

      t.is ( c (), 3 );

    });

    it ( 'supports dynamic dependencies', t => {

      const a = oby ( 1 );
      const b = oby ( 2 );
      const bool = oby ( false );
      const c = oby.computed ( () => bool () ? a () : b () );

      t.is ( c (), 2 );

      bool ( true );

      t.is ( c (), 1 );

    });

    it ( 'supports circular dependencies detection', t => {

      const a = oby ( 1 );
      const b = oby.computed ( () => a () + 1 );

      t.throws ( () => {
        oby.computed ( () => {
          a ( b () + 1 );
        });
      }, { message: 'Circular computation detected' } );

    });

  });

  describe ( 'from', it => {

    it ( 'makes an observable passed immediately to the function', t => {

      const o1 = oby.from ( () => {} );

      t.true ( oby.is ( o1 ) );
      t.is ( o1 (), undefined );

      const o2 = oby.from ( o => o ( 123 ) );

      t.true ( oby.is ( o2 ) );
      t.is ( o2 (), 123 );

    });

    it ( 'supports a disposer function', t => {

      const [fn, result] = spy ( () => {} );

      const o1 = oby.from ( () => fn );

      t.is ( result.calls, 0 );

      o1.dispose ();

      t.is ( result.calls, 1 );

      o1.dispose ();
      o1.dispose ();
      o1.dispose ();

      t.is ( result.calls, 1 );

    });

  });

  describe ( 'is', it => {

    it ( 'checks if a value is an observable', t => {

      t.true ( oby.is ( oby () ) );
      t.true ( oby.is ( oby ( 123 ) ) );
      t.true ( oby.is ( oby ( false ) ) );

      t.false ( oby.is () );
      t.false ( oby.is ( {} ) );
      t.false ( oby.is ( [] ) );

    });

    it ( 'supports the Observable class too', t => {

      t.true ( oby.is ( new Observable () ) );
      t.true ( oby.is ( new Observable ( 123 ) ) );
      t.true ( oby.is ( new Observable ( false ) ) );

    });

  });

});
