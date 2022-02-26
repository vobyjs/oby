
/* IMPORT */

const {describe} = require ( 'fava' );
const delay = require ( 'promise-resolve-timeout' );
const {default: $} = require ( '../../dist' );
const {default: Observable} = require ( '../../dist/observable' );

/* MAIN */

describe ( 'oby', it => {

  describe ( 'observable', it => {

    describe ( 'get', it => {

      it ( 'creates a dependency in a computed', t => {

        const o = $(1);

        let calls = 0;

        $.computed ( () => {
          calls += 1;
          o.get ();
        });

        t.is ( calls, 1 );

        o ( 2 );

        t.is ( calls, 2 );

        o ( 3 );

        t.is ( calls, 3 );

      });

      it ( 'creates a dependency in an effect', t => {

        const o = $(1);

        let calls = 0;

        $.effect ( () => {
          calls += 1;
          o.get ();
        });

        t.is ( calls, 1 );

        o ( 2 );

        t.is ( calls, 2 );

        o ( 3 );

        t.is ( calls, 3 );

      });

      it ( 'creates a single dependency in a computed even if called multiple times', t => {

        const o = $(1);

        let calls = 0;

        $.computed ( () => {
          calls += 1;
          o.get ();
          o.get ();
          o.get ();
        });

        t.is ( calls, 1 );

        o ( 2 );

        t.is ( calls, 2 );

        o ( 3 );

        t.is ( calls, 3 );

      });

      it ( 'creates a single dependency in an effect even if called multiple times', t => {

        const o = $(1);

        let calls = 0;

        $.effect ( () => {
          calls += 1;
          o.get ();
          o.get ();
          o.get ();
        });

        t.is ( calls, 1 );

        o ( 2 );

        t.is ( calls, 2 );

        o ( 3 );

        t.is ( calls, 3 );

      });

      it ( 'returns the current value', t => {

        const o = $(123);

        t.is ( o.get (), 123 );

        o ( 321 );

        t.is ( o.get (), 321 );

      });

    });

    describe ( 'sample', it => {

      it ( 'does not create a dependency in a computed', t => {

        const a = $(1);
        const b = $(2);

        let calls = 0;

        $.computed ( () => {
          calls += 1;
          a ();
          b.sample ();
          b.sample ();
          b.sample ();
        });

        t.is ( calls, 1 );

        b ( 3 );

        t.is ( calls, 1 );

        a ( 4 );
        a ( 5 );

        t.is ( calls, 3 );

      });

      it ( 'does not create a dependency in an effect', t => {

        const a = $(1);
        const b = $(2);

        let calls = 0;

        $.effect ( () => {
          calls += 1;
          a ();
          b.sample ();
          b.sample ();
          b.sample ();
        });

        t.is ( calls, 1 );

        b ( 3 );

        t.is ( calls, 1 );

        a ( 4 );
        a ( 5 );

        t.is ( calls, 3 );

      });

      it ( 'returns the current value', t => {

        const o = $(123);

        t.is ( o.sample (), 123 );

        o ( 321 );

        t.is ( o.sample (), 321 );

      });

    });

    describe ( 'set', it => {

      it ( 'does not create a dependency in a computed', t => {

        const o = $(1);

        let calls = 0;

        $.computed ( () => {
          calls += 1;
          o.set ( 2 );
          o.set ( 3 );
          o.set ( 4 );
        });

        t.is ( calls, 1 );

        o ( 5 );

        t.is ( calls, 1 );

      });

      it ( 'does not create a dependency in an effect', t => {

        const o = $(1);

        let calls = 0;

        $.computed ( () => {
          calls += 1;
          o.set ( 2 );
          o.set ( 3 );
          o.set ( 4 );
        });

        t.is ( calls, 1 );

        o ( 5 );

        t.is ( calls, 1 );

      });

      it ( 'returns the value being set', t => {

        const o = $();

        t.is ( o.set ( 123 ), 123 );

      });

      it ( 'supports a custom comparator', t => {

        const comparator = ( next, prev ) => next[0] === prev[0];

        const valuePrev = [1];
        const valueNext = [2];

        const o = $( valuePrev, { comparator } );

        o.set ( valuePrev );

        t.is ( o (), valuePrev );

        o.set ( [1] );

        t.is ( o (), valuePrev );

        o.set ( valueNext );

        t.is ( o (), valueNext );

        o.set ( [2] );

        t.is ( o (), valueNext );

      });

      it ( 'supports ignoring setters that do not change the value', t => {

        const o = $(1);

        let calls = 0;

        $.computed ( () => {
          calls += 1;
          o ();
        });

        const filteredValues = [0, -0, Infinity, NaN, 'foo', true, false, {}, [], Promise.resolve (), new Map (), new Set (), null, undefined, () => {}, Symbol ()];

        for ( const [index, value] of filteredValues.entries () ) {

          const callsExpected = index + 2;

          o.set ( value );

          t.is ( calls, callsExpected );

          o.set ( value );

          t.is ( calls, callsExpected );

        }

      });

      it ( 'updates the current value', t => {

        const o = $();

        o.set ( 123 );

        t.is ( o (), 123 );

        const noop1 = () => {};

        o.set ( noop1 );

        t.is ( o (), noop1 );

        const noop2 = () => {};

        o.set ( noop2 );

        t.is ( o (), noop2 );

      });

    });

    describe ( 'produce', it => {

      it ( 'does not create a dependency in a computed', t => {

        const o = $(1);

        let calls = 0;

        $.computed ( () => {
          calls += 1;
          o.produce ( prev => prev + 1 );
          o.produce ( prev => prev + 1 );
          o.produce ( prev => prev + 1 );
        });

        t.is ( calls, 1 );

        o ( 5 );

        t.is ( calls, 1 );

      });

      it ( 'does not create a dependency in an effect', t => {

        const o = $(1);

        let calls = 0;

        $.computed ( () => {
          calls += 1;
          o.produce ( prev => prev + 1 );
          o.produce ( prev => prev + 1 );
          o.produce ( prev => prev + 1 );
        });

        t.is ( calls, 1 );

        o ( 5 );

        t.is ( calls, 1 );

      });

      it ( 'supports updating with a new primitive value', t => {

        const o = $(1);

        t.is ( o.produce ( prev => prev + 1 ), 2 );
        t.is ( o (), 2 );

      });

      it ( 'supports updating with a new object value', t => {

        const valuePrev = [];
        const valueNext = [];

        const o = $(valuePrev);

        t.is ( o.produce ( () => valueNext ), valueNext );
        t.is ( o (), valueNext );

      });

      it ( 'supports updating with nothing', t => {

        const valuePrev = [];

        const o = $(valuePrev);

        t.not ( o.produce ( () => {} ), valuePrev );
        t.deepEqual ( o (), valuePrev );

      });

      it ( 'supports updating with in-place mutations', t => {

        const valuePrev = { foo: { bar: true } };
        const valueNext = { foo: { bar: false } };

        const o = $(valuePrev);

        t.not ( o.produce ( prev => { prev.foo.bar = false } ), valuePrev );
        t.deepEqual ( o (), valueNext );

        t.not ( o.produce ( prev => { prev.foo.bar = true } ), valuePrev );
        t.deepEqual ( o (), valuePrev );

      });

    });

    describe ( 'on', it => {

      it ( 'creates a computed of the current observable', t => {

        const o = $(2);
        const double = o.on ( value => value * value );

        t.is ( double (), 4 );

        o ( 4 );

        t.is ( double (), 16 );

      });

      it ( 'depends only on listed dependencies', t => {

        const a = $(3);
        const b = $(5);
        const c = $(7);
        const sum = a.on ( () => a.sample () + b.sample () + c.sample () );

        t.is ( sum (), 15 );

        a ( 4 );

        t.is ( sum (), 16 );

        b ( 6 );

        t.is ( sum (), 16 );

        c ( 8 );

        t.is ( sum (), 16 );

        a ( 5 );

        t.is ( sum (), 19 );

      });

      it ( 'supports an array of dependencies', t => {

        const a = $(3);
        const b = $(5);
        const c = $(7);
        const sum = a.on ( () => a.sample () + b.sample () + c.sample (), [b, c] );

        t.is ( sum (), 15 );

        a ( 4 );

        t.is ( sum (), 16 );

        b ( 6 );

        t.is ( sum (), 17 );

        c ( 8 );

        t.is ( sum (), 18 );

      });

      it ( 'supports a custom comparator', t => {

        const o = $(2);
        const comparator = value => ( value % 2 === 0 );
        const oPlus1 = o.on ( value => value + 1, { comparator } );

        t.is ( oPlus1 (), 3 );

        o ( 3 );

        t.is ( oPlus1 (), 3 );

        o ( 4 );

        t.is ( oPlus1 (), 5 );

        o ( 5 );

        t.is ( oPlus1 (), 5 );

      });

      it ( 'supports both an array of dependencies and a custom comparator', t => {

        const a = $(3);
        const b = $(5);
        const c = $(7);
        const comparator = value => ( value % 2 === 0 );

        const sum = a.on ( () => a.sample () + b.sample () + c.sample (), { comparator }, [b, c] );

        t.is ( sum (), 15 );

        a ( 4 );

        t.is ( sum (), 15 );

        b ( 6 );

        t.is ( sum (), 17 );

        c ( 8 );

        t.is ( sum (), 17 );

        c ( 9 );

        t.is ( sum (), 19 );

      });

    });

    it ( 'is both a getter and a setter', t => {

      const o = $();

      t.is ( o (), undefined );

      o ( 123 );

      t.is ( o (), 123 );

      o ( 321 );

      t.is ( o (), 321 );

      o ( undefined );

      t.is ( o (), undefined );

    });

    it ( 'creates a dependency in a computed when getting', t => {

      const o = $(1);

      let calls = 0;

      $.computed ( () => {
        calls += 1;
        o ();
      });

      t.is ( calls, 1 );

      o ( 2 );

      t.is ( calls, 2 );

      o ( 3 );

      t.is ( calls, 3 );

    });

    it ( 'creates a dependency in an effect when getting', t => {

      const o = $(1);

      let calls = 0;

      $.effect ( () => {
        calls += 1;
        o ();
      });

      t.is ( calls, 1 );

      o ( 2 );

      t.is ( calls, 2 );

      o ( 3 );

      t.is ( calls, 3 );

    });

    it ( 'does not create a dependency in a computed when setting', t => {

      let o;
      let calls = 0;

      $.computed ( () => {
        calls += 1;
        o = $(1);
      });

      t.is ( calls, 1 );

      o ( 2 );

      t.is ( calls, 1 );

    });

    it ( 'does not create a dependency in an effect when setting', t => {

      let o;
      let calls = 0;

      $.effect ( () => {
        calls += 1;
        o = $(1);
      });

      t.is ( calls, 1 );

      o ( 2 );

      t.is ( calls, 1 );

    });

    it ( 'supports an initial value', t => {

      const o = $(123);

      t.is ( o (), 123 );

    });

  });

  describe ( 'batch', it => {

    it ( 'batches changes within itself', t => {

      const a = $(9);
      const b = $(99);

      $.batch ( () => {
        a ( 10 );
        b ( 100 );
        t.is ( a (), 9 );
        t.is ( b (), 99 );
      });

      t.is ( a (), 10 );
      t.is ( b (), 100 );

    });

    it ( 'batches changes propagating outside of its scope', t => {

      $.root ( () => {

        const a = $(9);
        const b = $(99);

        const c = $.computed ( () => {
          return a () + b ();
        });

        $.batch ( () => {
          a ( 10 );
          b ( 100 );
          t.is ( c (), 9 + 99 );
        });

        t.is ( c (), 10 + 100 );

      });

    });

    it ( 'coalesces multiple events for the same observable together', t => {

      const o = $(1);

      let calls = 0;

      $.computed ( () => {
        calls += 1;
        o ();
      });

      t.is ( calls, 1 );

      $.batch ( () => {

        o ( 2 );
        o ( 3 );
        o ( 4 );
        o ( 5 );

        t.is ( calls, 1 );

      });

      t.is ( calls, 2 );

    });

    it ( 'returns undefined', t => {

      const o = $(0);

      const result = $.batch ( () => o () );

      t.is ( result, undefined );

    });

    it ( 'supports being nested', t => {

      const o = $(1);

      $.batch ( () => {
        o ( 2 );
        t.is ( o (), 1 );
        $.batch ( () => {
          o ( 3 );
          t.is ( o (), 1 );
          $.batch ( () => {
            o ( 4 );
          });
          t.is ( o (), 1 );
        });
        t.is ( o (), 1 );
      });

      t.is ( o (), 4 );

    });

  });

  describe ( 'cleanup', it => {

    it ( 'registers a function to be called when the parent computation updates', t => {

      const o = $(0);

      let sequence = '';

      $.computed ( () => {

        o ();

        $.cleanup ( () => {
          sequence += 'a';
        });

        $.cleanup ( () => {
          sequence += 'b';
        });

      });

      t.is ( sequence, '' );

      o ( 1 );

      t.is ( sequence, 'ab' );

      o ( 2 );

      t.is ( sequence, 'abab' );

      o ( 3 );

      t.is ( sequence, 'ababab' );

    });

    it ( 'registers a function to be called when the parent effect updates', t => {

      const o = $(0);

      let sequence = '';

      $.effect ( () => {

        o ();

        $.cleanup ( () => {
          sequence += 'a';
        });

        $.cleanup ( () => {
          sequence += 'b';
        });

      });

      t.is ( sequence, '' );

      o ( 1 );

      t.is ( sequence, 'ab' );

      o ( 2 );

      t.is ( sequence, 'abab' );

      o ( 3 );

      t.is ( sequence, 'ababab' );

    });

    it ( 'registers a function to be called when the parent root is disposed', t => {

      $.root ( dispose => {

        const o = $(0);

        let sequence = '';

        $.cleanup ( () => {
          sequence += 'a';
        });

        $.cleanup ( () => {
          sequence += 'b';
        });

        t.is ( sequence, '' );

        o ( 1 );
        o ( 2 );

        t.is ( sequence, '' );

        dispose ();

        t.is ( sequence, 'ab' );

        dispose ();
        dispose ();
        dispose ();

        t.is ( sequence, 'ab' );

      });

    });

    it ( 'returns undefined', t => {

      const result1 = $.cleanup ( () => {} );
      const result2 = $.cleanup ( () => {} );

      t.is ( result1, undefined );
      t.is ( result2, undefined );

    });

  });

  describe ( 'computed', it => {

    it ( 'returns an observable with the return of the function', t => {

      const a = $(1);
      const b = $(2);
      const c = $.computed ( () => a () + b () );

      t.true ( $.is ( c ) );
      t.is ( c (), 3 );

    });

    it ( 'returns an observable with value undefined if the function does not return anything', t => {

      const o = $.computed ( () => {} );

      t.true ( $.is ( o ) );
      t.is ( o (), undefined );

    });

    it ( 'returns the previous value to the function', t => {

      const a = $(1);
      const aPrev = $();

      const b = $.computed ( prev => {

        aPrev ( prev );

        return a ();

      });

      t.is ( a (), 1 );
      t.is ( b (), 1 );
      t.is ( aPrev (), undefined );

      a ( 2 );

      t.is ( a (), 2 );
      t.is ( b (), 2 );
      t.is ( aPrev (), 1 );

      a ( 3 );

      t.is ( a (), 3 );
      t.is ( b (), 3 );
      t.is ( aPrev (), 2 );

      a ( 4 );

      t.is ( a (), 4 );
      t.is ( b (), 4 );
      t.is ( aPrev (), 3 );

    });

    it ( 'supports a custom comparator', t => {

      const o = $(2);
      const comparator = value => ( value % 2 === 0 );
      const oPlus1 = $.computed ( () => o () + 1, undefined, { comparator } );

      t.is ( oPlus1 (), 3 );

      o ( 3 );

      t.is ( oPlus1 (), 3 );

      o ( 4 );

      t.is ( oPlus1 (), 5 );

      o ( 5 );

      t.is ( oPlus1 (), 5 );

    });

    it ( 'supports dynamic dependencies', t => {

      const a = $(1);
      const b = $(2);
      const bool = $(false);
      const c = $.computed ( () => bool () ? a () : b () );

      t.is ( c (), 2 );

      bool ( true );

      t.is ( c (), 1 );

    });

    it ( 'supports manually registering a function to be called when the parent computation updates', t => {

      const o = $(0);

      let sequence = '';

      $.computed ( () => {

        o ();

        $.cleanup ( () => {
          sequence += 'a';
        });

        $.cleanup ( () => {
          sequence += 'b';
        });

      });

      t.is ( sequence, '' );

      o ( 1 );

      t.is ( sequence, 'ab' );

      o ( 2 );

      t.is ( sequence, 'abab' );

      o ( 3 );

      t.is ( sequence, 'ababab' );

    });

    it ( 'supports manually registering a function to be called when the parent computation throws', t => {

      const o = $(0);

      let sequence = '';

      $.computed ( () => {

        $.error ( () => {
          sequence += 'a';
        });

        $.error ( () => {
          sequence += 'b';
        });

        if ( o () ) throw 'err';

      });

      t.is ( sequence, '' );

      o ( 1 );

      t.is ( sequence, 'ab' );

      o ( 2 );

      t.is ( sequence, 'abab' );

      o ( 3 );

      t.is ( sequence, 'ababab' );

    });

    it ( 'supports receiving an initial value', t => {

      const a = $(1);
      const aPrev = $();

      const b = $.computed ( prev => {

        aPrev ( prev );

        return a ();

      }, 0 );

      t.is ( a (), 1 );
      t.is ( b (), 1 );
      t.is ( aPrev (), 0 );

      a ( 2 );

      t.is ( a (), 2 );
      t.is ( b (), 2 );
      t.is ( aPrev (), 1 );

      a ( 3 );

      t.is ( a (), 3 );
      t.is ( b (), 3 );
      t.is ( aPrev (), 2 );

      a ( 4 );

      t.is ( a (), 4 );
      t.is ( b (), 4 );
      t.is ( aPrev (), 3 );

    });

    it ( 'updates the observable when the dependencies change', t => {

      const a = $(1);
      const b = $(2);
      const c = $.computed ( () => a () + b () );

      a ( 3 );
      b ( 7 );

      t.is ( c (), 10 );

    });

    it ( 'updates the observable when the dependencies change inside other computations', t => {

      const a = $(0);
      const b = $(0);
      let calls = 0;

      $.computed ( () => {
        calls += 1;
        a ();
      });

      t.is ( calls, 1 );

      $.computed ( () => {
        a ( 1 );
        b ();
        a ( 0 );
      });

      b ( 1 );

      t.is ( calls, 5 );

      a ( 1 );

      t.is ( calls, 6 );

    });

  });

  describe ( 'disposed', it => {

    it ( 'returns an observable that tells if the parent got disposed or not', async t => {

      const a = $(1);
      const values = [];

      $.effect ( () => {

        const disposed = $.disposed ();

        values.push ( disposed () );

        a ();

        setTimeout ( () => {

          values.push ( disposed () );

        }, 10 );

      });

      a ( 2 );
      a ( 3 );

      await delay ( 50 );

      t.deepEqual ( values, [false, false, false, true, true, false] );

    });

  });

  describe ( 'effect', it => {

    it ( 'returns undefined', t => {

      const a = $(1);
      const b = $(2);
      const c = $();

      const d = $.effect ( () => {
        c ( a () + b () );
      });

      t.is ( d, undefined );
      t.is ( c (), 3 );

    });

    it ( 'returns undefined to the function', t => {

      const a = $(1);
      const aPrev = $();

      $.effect ( prev => {

        aPrev ( prev );

        a ();

      });

      t.is ( a (), 1 );
      t.is ( aPrev (), undefined );

      a ( 2 );

      t.is ( a (), 2 );
      t.is ( aPrev (), undefined );

      a ( 3 );

      t.is ( a (), 3 );
      t.is ( aPrev (), undefined );

      a ( 4 );

      t.is ( a (), 4 );
      t.is ( aPrev (), undefined );

    });

    it ( 'supports dynamic dependencies', t => {

      const a = $(1);
      const b = $(2);
      const c = $();
      const bool = $(false);

      $.effect ( () => {
        c ( bool () ? a () : b () );
      });

      t.is ( c (), 2 );

      bool ( true );

      t.is ( c (), 1 );

    });

    it ( 'supports manually registering a function to be called when the parent effect updates', t => {

      const o = $(0);

      let sequence = '';

      $.effect ( () => {

        o ();

        $.cleanup ( () => {
          sequence += 'a';
        });

        $.cleanup ( () => {
          sequence += 'b';
        });

      });

      t.is ( sequence, '' );

      o ( 1 );

      t.is ( sequence, 'ab' );

      o ( 2 );

      t.is ( sequence, 'abab' );

      o ( 3 );

      t.is ( sequence, 'ababab' );

    });

    it ( 'supports manually registering a function to be called when the parent effect throws', t => {

      const o = $(0);

      let sequence = '';

      $.effect ( () => {

        $.error ( () => {
          sequence += 'a';
        });

        $.error ( () => {
          sequence += 'b';
        });

        if ( o () ) throw 'err';

      });

      t.is ( sequence, '' );

      o ( 1 );

      t.is ( sequence, 'ab' );

      o ( 2 );

      t.is ( sequence, 'abab' );

      o ( 3 );

      t.is ( sequence, 'ababab' );

    });

    it ( 'supports automatically registering a function to be called when the parent effect updates', t => {

      const o = $(0);

      let sequence = '';

      $.effect ( () => {

        o ();

        return () => {
          sequence += 'a';
          sequence += 'b';
        };

      });

      t.is ( sequence, '' );

      o ( 1 );

      t.is ( sequence, 'ab' );

      o ( 2 );

      t.is ( sequence, 'abab' );

      o ( 3 );

      t.is ( sequence, 'ababab' );

    });

    it ( 'updates when the dependencies change', t => {

      const a = $(1);
      const b = $(2);
      const c = $();

      $.effect ( () => {
        c ( a () + b () );
      });

      a ( 3 );
      b ( 7 );

      t.is ( c (), 10 );

    });

    it ( 'updates when the dependencies change inside other effects', t => {

      const a = $(0);
      const b = $(0);
      let calls = 0;

      $.effect ( () => {
        calls += 1;
        a ();
      });

      t.is ( calls, 1 );

      $.effect ( () => {
        a ( 1 );
        b ();
        a ( 0 );
      });

      b ( 1 );

      t.is ( calls, 5 );

      a ( 1 );

      t.is ( calls, 6 );

    });

  });

  describe ( 'error', it => {

    it ( 'registers a function to be called when the parent computation throws', t => {

      const o = $(0);

      let sequence = '';

      $.computed ( () => {

        $.error ( () => {
          sequence += 'a';
        });

        $.error ( () => {
          sequence += 'b';
        });

        if ( o () ) throw 'err';

      });

      t.is ( sequence, '' );

      o ( 1 );

      t.is ( sequence, 'ab' );

      o ( 2 );

      t.is ( sequence, 'abab' );

      o ( 3 );

      t.is ( sequence, 'ababab' );

    });

    it ( 'registers a function to be called when the parent effect throws', t => {

      const o = $(0);

      let sequence = '';

      $.effect ( () => {

        $.error ( () => {
          sequence += 'a';
        });

        $.error ( () => {
          sequence += 'b';
        });

        if ( o () ) throw 'err';

      });

      t.is ( sequence, '' );

      o ( 1 );

      t.is ( sequence, 'ab' );

      o ( 2 );

      t.is ( sequence, 'abab' );

      o ( 3 );

      t.is ( sequence, 'ababab' );

    });

    it ( 'registers a function to be called when the parent root throws', t => {

      let sequence = '';

      $.root ( () => {

        $.error ( () => {
          sequence += 'a';
        });

        $.error ( () => {
          sequence += 'b';
        });

        throw 'err';

      });

      t.is ( sequence, 'ab' );

    });

    it ( 'registers a function to be called when a child computation throws', t => {

      const o = $(0);

      let sequence = '';

      $.computed ( () => {

        $.error ( () => {
          sequence += 'a';
        });

        $.error ( () => {
          sequence += 'b';
        });

        $.computed ( () => {

          $.computed ( () => {

            if ( o () ) throw 'err';

          });

        });

      });

      t.is ( sequence, '' );

      o ( 1 );

      t.is ( sequence, 'ab' );

      o ( 2 );

      t.is ( sequence, 'abab' );

      o ( 3 );

      t.is ( sequence, 'ababab' );

    });

    it ( 'registers a function to be called when a child effect throws', t => {

      const o = $(0);

      let sequence = '';

      $.effect ( () => {

        $.error ( () => {
          sequence += 'a';
        });

        $.error ( () => {
          sequence += 'b';
        });

        $.effect ( () => {

          $.effect ( () => {

            if ( o () ) throw 'err';

          });

        });

      });

      t.is ( sequence, '' );

      o ( 1 );

      t.is ( sequence, 'ab' );

      o ( 2 );

      t.is ( sequence, 'abab' );

      o ( 3 );

      t.is ( sequence, 'ababab' );

    });

    it ( 'registers a function to be called when a child root throws', t => {

      let sequence = '';

      $.root ( () => {

        $.error ( () => {
          sequence += 'a';
        });

        $.error ( () => {
          sequence += 'b';
        });

        $.root ( () => {

          throw 'err';

        });

      });

      t.is ( sequence, 'ab' );

    });

    it ( 'returns undefined', t => {

      const result1 = $.error ( () => {} );
      const result2 = $.error ( () => {} );

      t.is ( result1, undefined );
      t.is ( result2, undefined );

    });

  });

  describe ( 'from', it => {

    it ( 'makes an observable passed immediately to the function', t => {

      const o1 = $.from ( () => {} );

      t.true ( $.is ( o1 ) );
      t.is ( o1 (), undefined );

      const o2 = $.from ( o => o ( 123 ) );

      t.true ( $.is ( o2 ) );
      t.is ( o2 (), 123 );

    });

    it ( 'supports automatically registering a disposer function', t => {

      let calls = 0;

      const disposer = () => calls += 1;

      const a = $(0);
      const b = $.from ( () => { a (); return disposer; } );

      t.true ( $.is ( b ) );

      t.is ( calls, 0 );

      a ( 1 );

      t.is ( calls, 1 );

      a ( 2 );
      a ( 3 );
      a ( 4 );

      t.is ( calls, 4 );

    });

  });

  describe ( 'get', it => {

    it ( 'creates a dependency in a computed', t => {

      const o = $(1);

      let calls = 0;

      $.computed ( () => {
        calls += 1;
        $.get ( o );
      });

      t.is ( calls, 1 );

      o ( 2 );

      t.is ( calls, 2 );

      o ( 3 );

      t.is ( calls, 3 );

    });

    it ( 'creates a dependency in an effect', t => {

      const o = $(1);

      let calls = 0;

      $.effect ( () => {
        calls += 1;
        $.get ( o );
      });

      t.is ( calls, 1 );

      o ( 2 );

      t.is ( calls, 2 );

      o ( 3 );

      t.is ( calls, 3 );

    });

    it ( 'gets the value out of an observable', t => {

      const o = $(123);

      t.is ( $.get ( o ), 123 );

    });

    it ( 'gets the value out of a nested observable', t => {

      const o = $($($($($(123)))));

      t.is ( $.get ( o ), 123 );

    });

    it ( 'gets the value out of a non-observable', t => {

      t.is ( $.get ( 123 ), 123 );

    });

  });

  describe ( 'is', it => {

    it ( 'checks if a value is an observable', t => {

      t.true ( $.is ( $() ) );
      t.true ( $.is ( $(123) ) );
      t.true ( $.is ( $(false) ) );
      t.true ( $.is ( $.computed ( () => {} ) ) );

      t.false ( $.is () );
      t.false ( $.is ( {} ) );
      t.false ( $.is ( [] ) );
      t.false ( $.is ( $.effect ( () => {} ) ) );
      t.false ( $.is ( new Observable () ) );

    });

  });

  describe ( 'root', it => {

    it ( 'allows child computations to escape their parents', t => {

      $.root ( () => {

        const outer = $(0);
        const inner = $(0);
        let innerCalls = 0;

        $.computed ( () => {
          outer ();
          $.root ( () => {
            $.computed ( () => {
              inner ();
              innerCalls += 1;
            });
          });
        });

        t.is ( innerCalls, 1 );

        outer ( 1 );
        outer ( 2 );

        t.is ( innerCalls, 3 );

        inner ( 1 );

        t.is ( innerCalls, 6 );

      });

    });

    it ( 'can be disposed', t => {

      $.root ( dispose => {

        let calls = 0;

        const a = $(0);
        const b = $.computed ( () => {
          calls += 1;
          return a ();
        });

        t.is ( calls, 1 );
        t.is ( b (), 0 );

        a ( 1 );

        t.is ( calls, 2 );
        t.is ( b (), 1 );

        dispose ();

        a ( 2 );

        t.is ( calls, 2 );
        t.is ( b (), 1 );

      });

    });

    it ( 'can be disposed from a child computation', t => {

      $.root ( dispose => {

        let calls = 0;

        const a = $(0);

        $.computed ( () => {
          calls += 1;
          if ( a () ) dispose ();
          a ();
        });

        t.is ( calls, 1 );

        a ( 1 );

        t.is ( calls, 2 );

        a ( 2 );

        t.is ( calls, 2 );

      });

    });

    it ( 'can be disposed from a child computation of a child computation', t => {

      $.root ( dispose => {

        let calls = 0;

        const a = $(0);

        $.computed ( () => {
          calls += 1;
          a ();
          $.computed ( () => {
            if ( a () ) dispose ();
          });
        });

        t.is ( calls, 1 );

        a ( 1 );

        t.is ( calls, 2 );

        a ( 2 );

        t.is ( calls, 2 );

      });

    });

    it ( 'does not batch updates', t => {

      $.root ( () => {

        const a = $(1);
        const b = $.computed ( () => a () );

        t.is ( b (), 1 );

        a ( 2 );

        t.is ( b (), 2 );

        a ( 3 );

        t.is ( b (), 3 );

      });

    });

    it ( 'persists through the entire scope when used at top level', t => {

      $.root ( () => {

        const a = $(1);

        const b = $.computed ( () => a () );

        a ( 2 );

        const c = $.computed ( () => a () );

        a ( 3 );

        t.is ( b (), 3 );
        t.is ( c (), 3 );

      });

    });

    it ( 'returns undefined', t => {

      const result = $.root ( () => 123 );

      t.is ( result, undefined );

    });

  });

  describe ( 'sample', it => {

    it ( 'does not leak computeds', t => {

      const o = $(1);

      let cleaned = false;

      $.computed ( () => {

        o ();

        $.sample ( () => {

          $.computed ( () => {

            $.cleanup ( () => {

              cleaned = true;

            });

          });

        });

      });

      t.is ( cleaned, false );

      o ( 2 );

      t.is ( cleaned, true );

    });

    it ( 'does not leak effects', t => {

      const o = $(1);

      let cleaned = false;

      $.effect ( () => {

        o ();

        $.sample ( () => {

          $.effect ( () => {

            $.cleanup ( () => {

              cleaned = true;

            });

          });

        });

      });

      t.is ( cleaned, false );

      o ( 2 );

      t.is ( cleaned, true );

    });

    it ( 'supports getting without creating dependencies', t => {

      const a = $(1);
      const b = $(2);
      const c = $(3);
      const d = $(0);

      let calls = 0;

      $.computed ( () => {
        calls += 1;
        a ();
        a.get ();
        d ( $.sample ( () => b () ) );
        c ();
        c.get ();
      });

      t.is ( calls, 1 );
      t.is ( d (), 2 );

      b ( 4 );

      t.is ( calls, 1 );
      t.is ( d (), 2 );

      a ( 5 );
      c ( 6 );

      t.is ( calls, 3 );
      t.is ( d (), 4 );

    });

  });

  it ( 'only propagates in topological order', t => {

    //    c1
    //   /  \
    //  /    \
    // b1     b2
    //  \    /
    //   \  /
    //    a1

    let sequence = '';

    const a1 = $(0);

    const b1 = $.computed ( () => {
      sequence += 'b1';
      const val = a1 () + 1;
      return val;
    });

    const b2 = $.computed ( () => {
      sequence += 'b2';
      return a1 () + 1;
    });

    const c1 = $.computed ( () => {
      b1 ();
      b2 ();
      sequence += 'c1';
    });

    sequence = '';

    a1 ( 1 );

    t.is ( sequence, 'b1b2c1' );

  });

  it ( 'only propagates once with linear convergences', t => {

    //         d
    //         |
    // +---+---+---+---+
    // v   v   v   v   v
    // f1  f2  f3  f4  f5
    // |   |   |   |   |
    // +---+---+---+---+
    //         v
    //         g

    const d = $(0);

    let calls = 0;

    const f1 = $.computed ( () => {
      return d ();
    });

    const f2 = $.computed ( () => {
      return d ();
    });

    const f3 = $.computed ( () => {
      return d ();
    });

    const f4 = $.computed ( () => {
      return d ();
    });

    const f5 = $.computed ( () => {
      return d ();
    });

    const g = $.computed ( () => {
      calls += 1;
      return f1 () + f2 () + f3 () + f4 () + f5 ();
    });

    calss = 0;

    d ( 0 );

    t.is ( calls, 1 );

  });

  it ( 'only propagates once with exponential convergence', t => {

    //     d
    //     |
    // +---+---+
    // v   v   v
    // f1  f2 f3
    //   \ | /
    //     O
    //   / | \
    // v   v   v
    // g1  g2  g3
    // +---+---+
    //     v
    //     h

    const d = $(0);

    let calls = 0;

    const f1 = $.computed ( () => {
      return d ();
    });

    const f2 = $.computed ( () => {
      return d ();
    });

    const f3 = $.computed ( () => {
      return d ();
    });

    const g1 = $.computed ( () => {
      return f1 () + f2 () + f3 ();
    });

    const g2 = $.computed ( () => {
      return f1 () + f2 () + f3 ();
    });

    const g3 = $.computed ( () => {
      return f1 () + f2 () + f3 ();
    });

    const h = $.computed ( () => {
      calls += 1;
      return g1 () + g2 () + g3 ();
    });

    calls = 0;

    d ( 1 );

    t.is ( calls, 1 );

  });

  it ( 'parent cleans up inner subscriptions', t => {

    const o = $(null);
    const cache = $(false);

    let calls = 0;
    let childValue;
    let childValue2;

    const child = o => {
      $.computed ( () => {
        childValue = o ();
        calls += 1;
      });
    };

    const child2 = o => {
      $.computed ( () => {
        childValue2 = o ();
      });
    };

    $.computed ( () => {
      const value = !!o ();
      cache ( value );
      return value;
    });

    // 1st

    $.computed ( () => {
      cache ();
      child2 ( o );
      child ( o );
    });

    t.is ( childValue, null );
    t.is ( childValue2, null );

    t.is ( calls, 1 );

    // 2nd

    o ( 'name' );

    t.is ( childValue, 'name' );
    t.is ( childValue2, 'name' );

    t.is ( calls, 2 );

    // 3rd

    o ( null );

    t.is ( childValue, null );
    t.is ( childValue2, null );

    t.is ( calls, 3 );

    // 4th

    o ( 'name2' );

    t.is ( childValue, 'name2' );
    t.is ( childValue2, 'name2' );

    t.is ( calls, 4 );

  });

  it ( 'parent cleans up inner conditional subscriptions', t => {

    const o = $(null);
    const cache = $(false);

    let calls = 0;
    let childValue;

    const child = o => {
      $.computed ( () => {
        childValue = o ();
        calls += 1;
      });
      return 'Hi';
    };

    $.computed ( () => {
      const value = !!o ();
      cache ( value );
      return value;
    });

    const memo = $.computed ( () => {
      const cached = cache ();
      return cached ? child ( o ) : undefined;
    });

    let view;

    $.computed ( () => ( view = memo () ) );

    t.is ( view, undefined );

    // 1st

    o ( 'name' );

    t.is ( childValue, 'name' );

    t.is ( view, 'Hi' );

    // 2nd

    o ( 'name2' );

    t.is ( childValue, 'name2' );

    // data is null -> cache is false -> child is not run here
    o(null);

    t.is ( childValue, 'name2' );

    t.is ( view, undefined );

    t.is ( calls, 2 );

  });

});
