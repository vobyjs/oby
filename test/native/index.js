
/* IMPORT */

import {describe} from 'fava';
import {produce} from 'immer';
import {setTimeout as delay} from 'node:timers/promises';
import $ from '../../dist/index.js';

/* HELPERS */

const isReadable = ( t, value ) => {

  t.true ( $.is ( value ) );
  t.true ( typeof value.get === 'function' );
  t.true ( typeof value.sample === 'function' );
  t.true ( typeof value.computed === 'function' );
  t.true ( typeof value.set === 'undefined' );
  t.true ( typeof value.produce === 'undefined' );
  t.true ( typeof value.update === 'undefined' );
  t.true ( typeof value.readonly === 'function' );
  t.true ( typeof value.isReadonly === 'function' );
  t.true ( typeof value.registerSelf === 'undefined' );

  t.throws ( () => value ( Math.random () ), { message: 'A readonly Observable can not be updated' } );

};

const isWritable = ( t, value ) => {

  t.true ( $.is ( value ) );
  t.true ( typeof value.get === 'function' );
  t.true ( typeof value.sample === 'function' );
  t.true ( typeof value.computed === 'function' );
  t.true ( typeof value.set === 'function' );
  t.true ( typeof value.produce === 'function' );
  t.true ( typeof value.update === 'function' );
  t.true ( typeof value.readonly === 'function' );
  t.true ( typeof value.isReadonly === 'function' );
  t.true ( typeof value.registerSelf === 'undefined' );

};

/* MAIN */

describe ( 'oby', () => {

  describe ( 'observable', () => {

    describe ( 'auto-accessor', it => {

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

    describe ( 'computed', it => {

      it ( 'creates a computed readonly observable out of a writable observable', t => {

        const o = $({ foo: { bar: 123 } });

        const computed = o.computed ( value => value.foo.bar );

        t.is ( computed (), 123 );

        o ({ foo: { bar: 321 } });

        t.is ( computed (), 321 );

        isReadable ( t, computed );

      });

      it ( 'creates a computed readonly observable out of a readable observable', t => {

        const o = $({ foo: { bar: 123 } }).readonly ();

        const computed = o.computed ( value => value.foo.bar );

        t.is ( computed (), 123 );

        isReadable ( t, computed );

      });

      it ( 'can receive an options object', t => {

        const equals = ( a, b ) => ( ( a - 1 ) % 2 ) === ( b % 2 );

        const o = $( 0, { equals });

        const computed = o.computed ( value => value );

        t.is ( computed (), 0 );

        o ( 1 );

        t.is ( computed (), 0 );

        o ( 2 );

        t.is ( computed (), 2 );

        o ( 3 );

        t.is ( computed (), 2 );

        o ( 4 );

        t.is ( computed (), 4 );

      });

      it ( 'can select the entire value out of a writable observable', t => {

        const o = $({ foo: { bar: 123 } });

        const computed = o.computed ( value => value );

        t.deepEqual ( computed (), o () );

        isReadable ( t, computed );

        t.not ( o, computed );

      });

      it ( 'can select the entire value out of a readable observable', t => {

        const o = $({ foo: { bar: 123 } }).readonly ();

        const computed = o.computed ( value => value );

        t.deepEqual ( computed (), o () );

        isReadable ( t, computed );

        t.not ( o, computed );

      });

      it ( 'subscribes to other observables too', t => {

        const a = $(1);
        const b = $(2);

        const computed = a.computed ( a => a * b () );

        t.is ( computed (), 2 );

        a ( 10 );

        t.is ( computed (), 20 );

        b ( 5 );

        t.is ( computed (), 50 );

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

      it ( 'returns the value being set even if equal to the previous value', t => {

        const equals = () => true;

        const o = $( 0, { equals } );

        t.is ( o (), 0 );
        t.is ( o.set ( 123 ), 123 )
        t.is ( o (), 0 );

      });

      it ( 'supports a custom equality function', t => {

        const equals = ( next, prev ) => next[0] === prev[0];

        const valuePrev = [1];
        const valueNext = [2];

        const o = $( valuePrev, { equals } );

        o.set ( valuePrev );

        t.is ( o (), valuePrev );

        o.set ( [1] );

        t.is ( o (), valuePrev );

        o.set ( valueNext );

        t.is ( o (), valueNext );

        o.set ( [2] );

        t.is ( o (), valueNext );

      });

      it ( 'supports a false equality function', t => {

        const equals = false;

        const o = $( { foo: true }, { equals } );

        let calls = 0;

        $.effect ( () => {

          calls += 1;
          o ();

        });

        t.is ( calls, 1 );

        o.update ( value => value.foo = true );

        t.is ( calls, 2 );

        o ( o () );

        t.is ( calls, 3 );

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

      it ( 'supports updating with in-place mutations with a custom produce method', t => {

        const _produce = $.produce;

        $.produce = produce;

        const valuePrev = { foo: { bar: true } };
        const valueNext = { foo: { bar: false } };

        const o = $(valuePrev);

        t.not ( o.produce ( prev => { prev.foo.bar = false } ), valuePrev );
        t.deepEqual ( o (), valueNext );

        t.not ( o.produce ( prev => { prev.foo.bar = true } ), valuePrev );
        t.deepEqual ( o (), valuePrev );

        $.produce = () => { throw new Error ( 'custom' ) };

        t.throws ( () => o.produce (), { message: 'custom' } );

        $.produce = _produce;

      });

    });

    describe ( 'update', it => {

      it ( 'does not create a dependency in a computed', t => {

        const o = $(1);

        let calls = 0;

        $.computed ( () => {
          calls += 1;
          o.update ( prev => prev + 1 );
          o.update ( prev => prev + 1 );
          o.update ( prev => prev + 1 );
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
          o.update ( prev => prev + 1 );
          o.update ( prev => prev + 1 );
          o.update ( prev => prev + 1 );
        });

        t.is ( calls, 1 );

        o ( 5 );

        t.is ( calls, 1 );

      });

      it ( 'supports updating with a new primitive value', t => {

        const o = $(1);

        t.is ( o.update ( prev => prev + 1 ), 2 );
        t.is ( o (), 2 );

      });

      it ( 'supports updating with a new object value', t => {

        const valuePrev = [];
        const valueNext = [];

        const o = $(valuePrev);

        t.is ( o.update ( () => valueNext ), valueNext );
        t.is ( o (), valueNext );

      });

    });

    describe ( 'readonly', it => {

      it ( 'returns a readonly observable out of the current one', t => {

        const o = $(1);
        const ro = o.readonly ();

        isReadable ( t, ro );

        t.is ( o (), 1 );
        t.is ( ro (), 1 );

        o ( 2 );

        t.is ( o (), 2 );
        t.is ( ro (), 2 );

        const ro2 = o.readonly ();
        const rro = ro.readonly ();

        t.is ( ro2 (), 2 );
        t.is ( rro (), 2 );

        t.true ( ro !== ro2 );
        t.true ( ro === rro );

      });

      it ( 'throws when attempting to set', t => {

        const ro = $().readonly ();

        t.throws ( () => ro ( 1 ), { message: 'A readonly Observable can not be updated' } );

      });

    });

    describe ( 'isReadonly', it => {

      it ( 'checks if a value is a readonly observable', t => {

        const o = $(1);
        const ro = o.readonly ();

        t.false ( o.isReadonly () );
        t.true ( ro.isReadonly () );

      });

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

    it ( 'returns the value being returned', t => {

      const o = $(0);

      const result = $.batch ( () => o () );

      t.is ( result, 0 );

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

    it ( 'cleans up dependencies properly when causing itself to re-execute', t => {

      const a = $(0);
      const b = $(0);

      let calls = 0;

      $.computed ( () => {

        calls += 1;

        if ( !a.sample () ) a ( a () + 1 );

        b ();

      });

      t.is ( calls, 2 );

      a ( 2 );

      t.is ( calls, 2 );

      b ( 1 );

      t.is ( calls, 3 );

    });

    it ( 'does not throw when disposing of itself', t => {

      t.notThrows ( () => {

        $.root ( dispose => {

          $.computed ( () => {

            dispose ();

            return 1;

          });

        });

      });

    });

    it ( 'returns a readable observable', t => {

      const o = $.computed ( () => {} );

      isReadable ( t, o );

    });

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

    it ( 'supports a custom equality function', t => {

      const o = $(2);
      const equals = value => ( value % 2 === 0 );
      const oPlus1 = $.computed ( () => o () + 1, undefined, { equals } );

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

    it ( 'updates the observable with the last value when causing itself to re-execute', t => {

      const o = $(0);

      const computed = $.computed ( () => {

        let value = o ();

        if ( !o () ) o ( 1 );

        return value;

      });

      t.is ( computed (), 1 );

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

  describe ( 'context', it => {

    it ( 'can read and write context values inside an effect', t => {

      $.effect ( () => {

        const ctx = Symbol ();
        const value = { foo: 123 };

        $.context ( ctx, value );

        t.is ( $.context ( ctx ), value );

      });

    });

    it ( 'can read and write context values inside a computed', t => {

      $.computed ( () => {

        const ctx = Symbol ();
        const value = { foo: 123 };

        $.context ( ctx, value );

        t.is ( $.context ( ctx ), value );

      });

    });

    it ( 'can read and write context values inside a root', t => {

      $.root ( () => {

        const ctx = Symbol ();
        const value = { foo: 123 };

        $.context ( ctx, value );

        t.is ( $.context ( ctx ), value );

      });

    });

    it ( 'can read and write context values inside a deep effect', t => {

      $.effect ( () => {

        const ctx = Symbol ();
        const value = { foo: 123 };

        $.context ( ctx, value );

        $.effect ( () => {

          t.is ( $.context ( ctx ), value );

        });

      });

    });

    it ( 'can read and write context values inside a deep computed', t => {

      $.computed ( () => {

        const ctx = Symbol ();
        const value = { foo: 123 };

        $.context ( ctx, value );

        $.computed ( () => {

          t.is ( $.context ( ctx ), value );

        });

      });

    });

    it ( 'can read and write context values inside a deep root', t => {

      $.root ( () => {

        const ctx = Symbol ();
        const value = { foo: 123 };

        $.context ( ctx, value );

        $.root ( () => {

          t.is ( $.context ( ctx ), value );

        });

      });

    });

    it ( 'returns undefined when setting', t => {

      $.effect ( () => {

        const ctx = Symbol ();
        const value = { foo: 123 };

        const ret = $.context ( ctx, value );

        t.is ( ret, undefined );

      });

    });

    it ( 'returns undefined for unknown contexts', t => {

      $.effect ( () => {

        const ctx = Symbol ();

        t.is ( $.context ( ctx ), undefined );

      });

    });

    it ( 'supports overriding the outer context', t => {

      $.effect ( () => {

        const ctx = Symbol ();
        const value = { foo: 123 };

        $.context ( ctx, value );

        $.effect ( () => {

          const value2 = { foo: 321 };

          $.context ( ctx, value2 );

          t.is ( $.context ( ctx ), value2 );

        });

        t.is ( $.context ( ctx ), value );

      });

    });

    it ( 'supports setting the value to undefined', t => {

      $.effect ( () => {

        const ctx = Symbol ();
        const value = { foo: 123 };

        $.context ( ctx, value );
        $.context ( ctx, undefined );

        t.is ( $.context ( ctx ), undefined );

      });

    });

    it ( 'works even outside a manually created owner', t => {

      const ctx = Symbol ();
      const value = { foo: 123 };

      $.context ( ctx, value );

      t.is ( $.context ( ctx ), value );

      $.effect ( () => {

        t.is ( $.context ( ctx ), value );

        const value2 = { foo: 321 };

        $.context ( ctx, value2 );

        t.is ( $.context ( ctx ), value2 );

      });

      t.is ( $.context ( ctx ), value );

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

    it ( 'returns a readable observable', t => {

      const o = $.from ( () => {} );

      isReadable ( t, o );

    });

  });

  describe ( 'effect', it => {

    it ( 'checks if the returned value is actually a function', t => {

      t.notThrows ( () => {

        $.effect ( () => 123 );

      });

    });

    it ( 'cleans up dependencies properly when causing itself to re-execute', t => {

      const a = $(0);
      const b = $(0);

      let calls = 0;

      $.effect ( () => {

        calls += 1;

        if ( !a.sample () ) a ( a () + 1 );

        b ();

      });

      t.is ( calls, 2 );

      a ( 2 );

      t.is ( calls, 2 );

      b ( 1 );

      t.is ( calls, 3 );

    });

    it ( 'returns a disposer', t => {

      const a = $(1);
      const b = $(2);
      const c = $();

      const dispose = $.effect ( () => {
        c ( a () + b () );
      });

      t.is ( c (), 3 );

      dispose ();

      a ( 2 );

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

    it ( 'casts an error thrown inside a parent computation to an Error instance', t => {

      $.computed ( () => {

        $.error ( error => {

          t.true ( error instanceof Error );
          t.is ( error.message, 'err' );

        });

        throw 'err';

      });

    });

    it ( 'casts an error thrown inside a parent effect to an Error instance', t => {

      $.effect ( () => {

        $.error ( error => {

          t.true ( error instanceof Error );
          t.is ( error.message, 'err' );

        });

        throw 'err';

      });

    });

    it ( 'casts an error thrown inside a parent root to an Error instance', t => {

      $.root ( () => {

        $.error ( error => {

          t.true ( error instanceof Error );
          t.is ( error.message, 'err' );

        });

        throw 'err';

      });

    });

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

    it ( 'throws if the error handler in a computation throws', t => {

      t.throws ( () => {

        $.computed ( () => {

          $.error ( () => {
            throw new Error ( 'Inner error' );
          });

          throw 'err';

        });

      }, { message: 'Inner error' } );

    });

    it ( 'throws if the error handler in an effect throws', t => {

      t.throws ( () => {

        $.effect ( () => {

          $.error ( () => {
            throw new Error ( 'Inner error' );
          });

          throw 'err';

        });

      }, { message: 'Inner error' } );

    });

    it ( 'throws if the error handler in a root throws', t => {

      t.throws ( () => {

        $.root ( () => {

          $.error ( () => {
            throw new Error ( 'Inner error' );
          });

          throw 'err';

        });

      }, { message: 'Inner error' } );

    });

  });

  describe ( 'errorBoundary', it => {

    it ( 'can catch and recover from errors', t => {

      const o = $(false);

      let err, recover;

      const fallback = ({ error, reset }) => {
        err = error;
        recover = reset;
        return 'fallback';
      };

      const regular = () => {
        if ( o () ) throw 'whoops';
        return 'regular';
      };

      const computed = $.errorBoundary ( fallback, regular );

      t.is ( computed (), 'regular' );

      o ( true );

      t.true ( err instanceof Error );
      t.is ( err.message, 'whoops' );

      t.is ( computed (), 'fallback' );

      o ( false );

      recover ();

      t.is ( computed (), 'regular' );

    });

    it ( 'casts thrown errors to Error instances', t => {

      const fallback = ({ error }) => {
        t.true ( error instanceof Error );
        t.is ( error.message, 'err' );
      };

      const regular = () => {
        throw 'err';
      };

      $.errorBoundary ( fallback, regular );

    });

    it ( 'resolves the fallback before returning it', t => {

      const computed = $.errorBoundary ( () => () => () => 123, () => { throw 'err' } );

      t.is ( computed (), 123 );

    });

    it ( 'resolves the value before returning it', t => {

      const computed = $.errorBoundary ( () => {}, () => () => () => 123 );

      t.is ( computed (), 123 );

    });

  });

  describe ( 'from', it => {

    it ( 'can receive an options object', t => {

      const equals = ( a, b ) => ( ( a - 1 ) % 2 ) === ( b % 2 );

      const o1 = $(0);
      const o2 = $.from ( observable => observable ( o1 () ), { equals } );

      t.is ( o2 (), 0 );

      o1 ( 1 );

      t.is ( o2 (), 0 );

      o1 ( 2 );

      t.is ( o2 (), 2 );

      o1 ( 3 );

      t.is ( o2 (), 2 );

      o1 ( 4 );

      t.is ( o2 (), 4 );

    });

    it ( 'makes an observable passed immediately to the function', t => {

      const o1 = $.from ( () => {} );

      t.true ( $.is ( o1 ) );
      t.is ( o1 (), undefined );

      const o2 = $.from ( o => o ( 123 ) );

      t.true ( $.is ( o2 ) );
      t.is ( o2 (), 123 );

    });

    it ( 'passes a writable observable to the function', t => {

      $.from ( o => {

        isWritable ( t, o );

      });

    });

    it ( 'returns a readable observable', t => {

      const o = $.from ( () => {} );

      isReadable ( t, o );

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

    it ( 'gets the value out of a non-observable', t => {

      t.is ( $.get ( 123 ), 123 );

    });

  });

  describe ( 'if', it => {

    it ( 'resolves the value before returning it', t => {

      t.is ( $.if ( true, () => () => 123 )(), 123 );

    });

    it ( 'returns a computed to the value or undefined with a functional condition', t => {

      const o = $(false);

      const result = $.if ( o, 123 );

      t.is ( result (), undefined );

      o ( true );

      t.is ( result (), 123 );

      o ( false );

      t.is ( result (), undefined );

    });

    it ( 'returns a computed to the value with a truthy condition', t => {

      t.is ( $.if ( true, 123 )(), 123 );
      t.is ( $.if ( 'true', 123 )(), 123 );

    });

    it ( 'returns a computed to the value with a falsy condition', t => {

      t.is ( $.if ( false, 123 )(), undefined );
      t.is ( $.if ( 0, 123 )(), undefined );

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

    });

  });

  describe ( 'map', it => {

    it ( 'assumes a function returning an array of unique values', t => {

      const array = [1, 2, 3, 1, 2, 3];
      const args = [];

      $.map ( () => array, value => {
        args.push ( value );
      });

      t.deepEqual ( args, [1, 2, 3] );

    });

    it ( 'assumes an array of unique values', t => {

      const array = [1, 2, 3, 1, 2, 3];
      const args = [];

      $.map ( array, value => {
        args.push ( value );
      });

      t.deepEqual ( args, [1, 2, 3] );

    });

    it ( 'disposes of any reactivity when the parent computation is disposed', t => {

      const o1 = $(1);
      const o2 = $(2);
      const array = $([o1, o2]);
      const args = [];

      const dispose = $.root ( dispose => {
        $.computed ( () => {
          $.map ( array, value => {
            $.computed ( () => {
              args.push ( value () );
            });
          });
        });
        return dispose;
      });

      dispose ();

      t.deepEqual ( args, [1, 2] );

      o1 ( 11 );
      o2 ( 22 );

      t.deepEqual ( args, [1, 2] );

    });

    it ( 'disposes of any reactivity when the parent effect is disposed', t => {

      const o1 = $(1);
      const o2 = $(2);
      const array = $([o1, o2]);
      const args = [];

      const dispose = $.root ( dispose => {
        $.effect ( () => {
          $.map ( array, value => {
            $.computed ( () => {
              args.push ( value () );
            });
          });
        });
        return dispose;
      });

      dispose ();

      t.deepEqual ( args, [1, 2] );

      o1 ( 11 );
      o2 ( 22 );

      t.deepEqual ( args, [1, 2] );

    });

    it ( 'disposes of any reactivity when the parent root is disposed', t => {

      const o1 = $(1);
      const o2 = $(2);
      const array = $([o1, o2]);
      const args = [];

      const dispose = $.root ( dispose => {
        $.map ( array, value => {
          $.computed ( () => {
            args.push ( value () );
          });
        });
        return dispose;
      });

      dispose ();

      t.deepEqual ( args, [1, 2] );

      o1 ( 11 );
      o2 ( 22 );

      t.deepEqual ( args, [1, 2] );

    });

    it ( 'disposes of any reactivity created for items that got deleted', t => {

      const o1 = $(1);
      const o2 = $(2);
      const array = $([o1, o2]);
      const args = [];

      $.map ( array, value => {
        $.computed ( () => {
          args.push ( value () );
        });
      });

      t.deepEqual ( args, [1, 2] );

      o1 ( 11 );

      t.deepEqual ( args, [1, 2, 11] );

      o2 ( 22 );

      t.deepEqual ( args, [1, 2, 11, 22] );

      array ([ o1 ]);

      t.deepEqual ( args, [1, 2, 11, 22] );

      o1 ( 111 );

      t.deepEqual ( args, [1, 2, 11, 22, 111] );

      o2 ( 22 );

      t.deepEqual ( args, [1, 2, 11, 22, 111] );

    });

    it ( 'renders only results for unknown values', t => {

      const array = $([1, 2, 3]);
      const args = [];

      $.map ( array, value => {
        args.push ( value );
      });

      t.deepEqual ( args, [1, 2, 3] );

      array ([ 1, 2, 3, 4 ]);

      t.deepEqual ( args, [1, 2, 3, 4] );

      array ([ 1, 2, 3, 4, 5 ]);

      t.deepEqual ( args, [1, 2, 3, 4, 5] );

    });

  });

  describe ( 'produce', it => {

    it ( 'supports updating with in-place mutations', t => {

      const valuePrev = { foo: { bar: true } };
      const valueNext = { foo: { bar: false } };

      t.not ( $.produce ( valuePrev, prev => { prev.foo.bar = false } ), valuePrev );
      t.deepEqual ( $.produce ( valuePrev, prev => { prev.foo.bar = false } ), valueNext );

      t.not ( $.produce ( valuePrev, prev => { prev.foo.bar = true } ), valuePrev );
      t.deepEqual ( $.produce ( valuePrev, prev => { prev.foo.bar = true } ), valuePrev );

    });

    it ( 'supports updating with in-place mutations with a custom produce method', t => {

      const _produce = $.produce;

      $.produce = produce;

      const valuePrev = { foo: { bar: true } };
      const valueNext = { foo: { bar: false } };

      t.not ( $.produce ( valuePrev, prev => { prev.foo.bar = false } ), valuePrev );
      t.deepEqual ( $.produce ( valuePrev, prev => { prev.foo.bar = false } ), valueNext );

      t.is ( $.produce ( valuePrev, prev => { prev.foo.bar = true } ), valuePrev );
      t.deepEqual ( $.produce ( valuePrev, prev => { prev.foo.bar = true } ), valuePrev );

      $.produce = () => { throw new Error ( 'custom' ) };

      t.throws ( () => $.produce (), { message: 'custom' } );

      $.produce = _produce;

    });

  });

  describe ( 'resolve', it => {

    it ( 'does nothing for other other types of values', t => {

      const obj = { foo: () => 123, bar: [() => 123] };

      t.deepEqual ( $.resolve ( obj ), obj );

    });

    it ( 'resolves a plain value', t => {

      t.is ( $.resolve ( 123 ), 123 );

    });

    it ( 'resolves a function', t => {

      t.is ( $.resolve ( () => 123 ), 123 );

    });

    it ( 'resolves a nested function', t => {

      t.is ( $.resolve ( () => () => () => 123 ), 123 );

    });

    it ( 'resolves a plain array', t => {

      t.deepEqual ( $.resolve ( [123] ), [123] );

    });

    it ( 'resolves an array containing a function', t => {

      t.deepEqual ( $.resolve ( [() => 123] ), [123] );

    });

    it ( 'resolves an array containing arrays and functions', t => {

      t.deepEqual ( $.resolve ( [() => 123, [() => () => [() => 123]]] ), [123, [[123]]] );

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

    it ( 'returns whatever the function returns', t => {

      const result = $.root ( () => 123 );

      t.is ( result, 123 );

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

  describe ( 'selector', it => {

    it ( 'efficiently tells when the provided item is the selected one', t => {

      const values = [1, 2, 3, 4, 5];
      const selected = $(-1);

      const select = value => selected ( value );
      const isSelected = $.selector ( selected );

      let sequence = '';

      values.forEach ( value => {

        $.effect ( () => {

          sequence += value;

          if ( !isSelected ( value ) ) return;

          sequence += value;

        });

      });

      t.is ( sequence, '12345' );

      select ( 1 );

      t.is ( sequence, '1234511' );

      select ( 2 );

      t.is ( sequence, '1234511122' );

      select ( -1 );

      t.is ( sequence, '12345111222' );

    });

  });

  describe ( 'switch', it => {

    it ( 'resolves the value of a case before returning it', t => {

        const result = $.switch ( 1, [[1, () => () => '1'], [2, '2'], [1, '1.1']] );

        t.is ( result (), '1' );

    });

    it ( 'resolves the value of the default case before returning it', t => {

      const result = $.switch ( 2, [[1, '1'], [() => () => 'default'], [2, '2'] [1, '1.1']] );

      t.is ( result (), 'default' );

    });

    it ( 'returns a computed to matching case or the default case with a functional condition', t => {

      const o = $(1);

      const result = $.switch ( o, [[1, '1'], [2, '2'], [1, '1.1'], ['default']] );

      t.is ( result (), '1' );

      o ( 2 );

      t.is ( result (), '2' );

      o ( 3 );

      t.is ( result (), 'default' );

    });

    it ( 'returns a computed to the value of the default case if no case before it matches', t => {

      const result = $.switch ( 2, [[1, '1'], ['default'], [2, '2'] [1, '1.1']] );

      t.is ( result (), 'default' );

    });

    it ( 'returns a computed to the value of the first matching case', t => {

      const result1 = $.switch ( 1, [[1, '1'], [2, '2'], [1, '1.1']] );

      t.is ( result1 (), '1' );

      const result2 = $.switch ( 2, [[1, '1'], [2, '2'], [1, '1.1']] );

      t.is ( result2 (), '2' );

    });

    it ( 'returns a computed to undefined if no condition matches and there is no default case', t => {

      const result = $.switch ( 1, [[2, '2'], [3, '3']] );

      t.is ( result (), undefined );

    });

  });

  describe ( 'ternary', it => {

    it ( 'resolves the first value before returning it', t => {

      t.is ( $.ternary ( true, () => () => 123, 321 )(), 123 );

    });

    it ( 'resolves the second value before returning it', t => {

      t.is ( $.ternary ( false, 123, () => () => 321 )(), 321 );

    });

    it ( 'returns a computed to the first or second value with a functional condition', t => {

      const o = $(false);

      const result = $.ternary ( o, 123, 321 );

      t.is ( result (), 321 );

      o ( true );

      t.is ( result (), 123 );

      o ( false );

      t.is ( result (), 321 );

    });

    it ( 'returns a computed to the first value with a truthy condition', t => {

      t.is ( $.ternary ( true, 123, 321 )(), 123 );
      t.is ( $.ternary ( 'true', 123, 321 )(), 123 );

    });

    it ( 'returns a computed to the value with a falsy condition', t => {

      t.is ( $.ternary ( false, 123, 321 )(), 321 );
      t.is ( $.ternary ( 0, 123, 321 )(), 321 );

    });

  });

  describe ( 'S-like propagation', it => {

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

      calls = 0;

      d ( 1 );

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

      $.computed ( () => {
        view = memo ();
        return view;
      });

      t.is ( view, undefined );

      // 1st

      o ( 'name' );

      t.is ( childValue, 'name' );

      t.is ( view, 'Hi' );

      // 2nd

      o ( 'name2' );

      t.is ( childValue, 'name2' );

      // 3rd
      // data is null -> cache is false -> child is not run here

      o ( null );

      t.is ( childValue, 'name2' );

      t.is ( view, undefined );

      t.is ( calls, 2 );

    });

  });

});
