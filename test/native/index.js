
/* IMPORT */

import {describe} from 'fava';
import {setTimeout as delay} from 'node:timers/promises';
import $ from '../../dist/index.js';

/* HELPERS */

const isReadable = ( t, value ) => {

  t.true ( $.is ( value ) );
  t.true ( typeof value.read === 'undefined' );
  t.true ( typeof value.write === 'undefined' );
  t.true ( typeof value.value === 'undefined' );
  t.true ( typeof value.bind === 'function' );
  t.true ( typeof value.apply === 'function' );

  t.throws ( () => value ( Math.random () ), { message: 'A readonly Observable can not be updated' } );

};

const isWritable = ( t, value ) => {

  t.true ( $.is ( value ) );
  t.true ( typeof value.read === 'undefined' );
  t.true ( typeof value.write === 'undefined' );
  t.true ( typeof value.value === 'undefined' );
  t.true ( typeof value.bind === 'function' );
  t.true ( typeof value.apply === 'function' );

};

/* MAIN */

describe ( 'oby', () => {

  describe ( 'observable', it => {

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

    it ( 'creates a single dependency in a computed even if getting multiple times', t => {

      const o = $(1);

      let calls = 0;

      $.computed ( () => {
        calls += 1;
        o ();
        o ();
        o ();
      });

      t.is ( calls, 1 );

      o ( 2 );

      t.is ( calls, 2 );

      o ( 3 );

      t.is ( calls, 3 );

    });

    it ( 'creates a single dependency in an effect even if getting multiple times', t => {

      const o = $(1);

      let calls = 0;

      $.effect ( () => {
        calls += 1;
        o ();
        o ();
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

    it ( 'does not create a dependency in a computed when setting with a function', t => {

      const o = $(1);

      let calls = 0;

      $.computed ( () => {
        calls += 1;
        o ( prev => prev + 1 );
        o ( prev => prev + 1 );
        o ( prev => prev + 1 );
      });

      t.is ( calls, 1 );

      o ( 5 );

      t.is ( calls, 1 );

    });

    it ( 'does not create a dependency in an effect when setting with a function', t => {

      const o = $(1);

      let calls = 0;

      $.computed ( () => {
        calls += 1;
        o ( prev => prev + 1 );
        o ( prev => prev + 1 );
        o ( prev => prev + 1 );
      });

      t.is ( calls, 1 );

      o ( 5 );

      t.is ( calls, 1 );

    });

    it ( 'does not emit when the setter does not change the value', t => {

      const o = $(1);

      let calls = 0;

      $.computed ( () => {
        calls += 1;
        o ();
      });

      const filteredValues = [0, -0, Infinity, NaN, 'foo', true, false, {}, [], Promise.resolve (), new Map (), new Set (), null, undefined, () => {}, Symbol ()];

      for ( const [index, value] of filteredValues.entries () ) {

        const callsExpected = index + 2;

        o ( () => value );

        t.is ( calls, callsExpected );

        o ( () => value );

        t.is ( calls, callsExpected );

      }

    });

    it ( 'returns the value being set', t => {

      const o = $();

      t.is ( o ( 123 ), 123 );

    });

    it ( 'returns the value being set even if equal to the previous value', t => {

      const equals = () => true;

      const o = $( 0, { equals } );

      t.is ( o (), 0 );
      t.is ( o ( 123 ), 123 )
      t.is ( o (), 0 );

    });

    it ( 'supports an initial value', t => {

      const o = $(123);

      t.is ( o (), 123 );

    });

    it ( 'supports a custom equality function', t => {

      const equals = ( next, prev ) => next[0] === prev[0];

      const valuePrev = [1];
      const valueNext = [2];

      const o = $( valuePrev, { equals } );

      o ( valuePrev );

      t.is ( o (), valuePrev );

      o ( [1] );

      t.is ( o (), valuePrev );

      o ( valueNext );

      t.is ( o (), valueNext );

      o ( [2] );

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

      o ( value => value.foo = true );

      t.is ( calls, 2 );

      o ( o () );

      t.is ( calls, 3 );

    });

    it ( 'supports updating with a new primitive value', t => {

      const o = $(1);

      t.is ( o ( prev => prev + 1 ), 2 );
      t.is ( o (), 2 );

    });

    it ( 'supports updating with a new object value', t => {

      const valuePrev = [];
      const valueNext = [];

      const o = $(valuePrev);

      t.is ( o ( () => valueNext ), valueNext );
      t.is ( o (), valueNext );

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

    it ( 'returns non-functions as is', t => {

      const values = [0, -0, Infinity, NaN, 'foo', true, false, {}, [], Promise.resolve (), new Map (), new Set (), null, undefined, Symbol ()];

      for ( const value of values ) {

        t.is ( value, $.batch ( value ) );

      }

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

    it ( 'registers a function to be called when the parent computation is disposed', t => {

      let sequence = '';

      $.root ( dispose => {

        $.computed ( () => {

          $.cleanup ( () => {
            sequence += 'a';
          });

          $.cleanup ( () => {
            sequence += 'b';
          });

        });

        dispose ();

      });

      t.is ( sequence, 'ab' );

    });

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

    it ( 'registers a function to be called when the parent computation is disposed', t => {

      let sequence = '';

      $.root ( dispose => {

        $.effect ( () => {

          $.cleanup ( () => {
            sequence += 'a';
          });

          $.cleanup ( () => {
            sequence += 'b';
          });

        });

        dispose ();

      });

      t.is ( sequence, 'ab' );

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

    it ( 'can not be running multiple times concurrently', t => {

      const o = $(0);

      let executions = 0;

      const result = $.computed ( () => {

        executions += 1;

        const value = o ();

        t.is ( executions, 1 );

        if ( value === 0 ) o ( 1 );
        if ( value === 1 ) o ( 2 );
        if ( value === 2 ) o ( 3 );

        t.is ( executions, 1 );

        executions -= 1;

        t.is ( executions, 0 );

        return value;

      });

      t.is ( result (), 3 );

    });

    it ( 'cleans up dependencies properly when causing itself to re-execute', t => {

      const a = $(0);
      const b = $(0);

      let calls = 0;

      $.computed ( () => {

        calls += 1;

        if ( !$.sample ( a ) ) a ( a () + 1 );

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

      const o = $.disposed ();

      isReadable ( t, o );

    });

  });

  describe ( 'effect', it => {

    it ( 'can not be running multiple times concurrently', t => {

      const o = $(0);

      let executions = 0;

      $.effect ( () => {

        executions += 1;

        const value = o ();

        t.is ( executions, 1 );

        if ( value === 0 ) o ( 1 );
        if ( value === 1 ) o ( 2 );
        if ( value === 2 ) o ( 3 );

        t.is ( executions, 1 );

        executions -= 1;

        t.is ( executions, 0 );

      });

    });

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

        if ( !$.sample ( a ) ) a ( a () + 1 );

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

  describe ( 'for', it => {

    it ( 'assumes a function returning an array of unique values', t => {

      const array = [1, 2, 3, 1, 2, 3];
      const args = [];

      $.for ( () => array, value => {
        args.push ( value );
      });

      t.deepEqual ( args, [1, 2, 3] );

    });

    it ( 'assumes an array of unique values', t => {

      const array = [1, 2, 3, 1, 2, 3];
      const args = [];

      $.for ( array, value => {
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
          $.for ( array, value => {
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
          $.for ( array, value => {
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
        $.for ( array, value => {
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

      $.for ( array, value => {
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

      $.for ( array, value => {
        args.push ( value );
      });

      t.deepEqual ( args, [1, 2, 3] );

      array ([ 1, 2, 3, 4 ]);

      t.deepEqual ( args, [1, 2, 3, 4] );

      array ([ 1, 2, 3, 4, 5 ]);

      t.deepEqual ( args, [1, 2, 3, 4, 5] );

    });

    it ( 'resolves the fallback value before returning it', t => {

      const result = $.for ( [], () => () => 123, () => () => 321 );

      isReadable ( t, result );
      isReadable ( t, result () );
      isReadable ( t, result ()() );

      t.is ( result ()()(), 321 );

    });

    it ( 'resolves the mapped value before returning it', t => {

      const result = $.for ( [1], () => () => () => 123 );

      isReadable ( t, result );
      isReadable ( t, result ()[0] );
      isReadable ( t, result ()[0]() );

      t.is ( result ()[0]()(), 123 );

    });

    it ( 'returns a computed to an empty array for an empty array and missing fallback', t => {

      t.deepEqual ( $.for ( [], () => () => 123 )(), [] );

    });

    it ( 'returns a computed to fallback for an empty array and a provided fallback', t => {

      t.is ( $.for ( [], () => () => 123, 123 )(), 123 );

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

    it ( 'does not resolve values again when the condition changes but the reuslt branch is the same', t => {

      let sequence = '';

      const condition = $(1);

      const valueTrue = () => {
        sequence += 't';
      };

      const valueFalse = () => {
        sequence += 'f';
      };

      $.if ( condition, valueTrue, valueFalse );

      condition ( 2 );
      condition ( 3 );

      t.is ( sequence, 't' );

      condition ( 0 );
      condition ( false );

      t.is ( sequence, 'tf' );

      condition ( 4 );
      condition ( 5 );

      t.is ( sequence, 'tft' );

    });

    it ( 'resolves the fallback value before returning it', t => {

      const result = $.if ( false, 123, () => () => 123 );

      isReadable ( t, result );
      isReadable ( t, result () );
      isReadable ( t, result ()() );

      t.is ( result ()()(), 123 );

    });

    it ( 'resolves the value before returning it', t => {

      const result = $.if ( true, () => () => 123 );

      isReadable ( t, result );
      isReadable ( t, result () );
      isReadable ( t, result ()() );

      t.is ( result ()()(), 123 );

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

    it ( 'returns a computed to undefined for a falsy condition and missing fallback', t => {

      t.is ( $.if ( false, 123 )(), undefined );

    });

    it ( 'returns a computed to fallback for a falsy condition and a provided fallback', t => {

      t.is ( $.if ( false, 123, 321 )(), 321 );

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

  describe ( 'readonly', it => {

    it ( 'returns a readonly observable out of the passed one', t => {

      const o = $(1);
      const ro = $.readonly ( o );

      isReadable ( t, ro );

      t.is ( o (), 1 );
      t.is ( ro (), 1 );

      o ( 2 );

      t.is ( o (), 2 );
      t.is ( ro (), 2 );

      const ro2 = $.readonly ( o );
      const rro = $.readonly ( ro );

      t.is ( ro2 (), 2 );
      t.is ( rro (), 2 );

      t.true ( ro !== ro2 );
      t.true ( ro !== rro );

    });

    it ( 'throws when attempting to set', t => {

      const ro = $.readonly ( $() );

      t.throws ( () => ro ( 1 ), { message: 'A readonly Observable can not be updated' } );

    });

  });

  describe ( 'resolve', it => {

    it ( 'properly disposes of inner computeds', t => {

      const o = $(2);

      let calls = 0;

      const dispose = $.root ( dispose => {

        const fn = () => {
          $.computed ( () => {
            calls += 1;
            return o () ** 2;
          });
        };

        $.resolve ( fn );

        return dispose;

      });

      t.is ( calls, 1 );

      o ( 3 );

      t.is ( calls, 2 );

      dispose ();

      o ( 4 );

      t.is ( calls, 2 );

    });

    it ( 'properly disposes of inner effects', t => {

      const o = $(2);

      let calls = 0;

      const dispose = $.root ( dispose => {

        const fn = () => {
          $.effect ( () => {
            calls += 1;
            o () ** 2;
          });
        };

        $.resolve ( fn );

        return dispose;

      });

      t.is ( calls, 1 );

      o ( 3 );

      t.is ( calls, 2 );

      dispose ();

      o ( 4 );

      t.is ( calls, 2 );

    });

    it ( 'resolves an array', t => {

      const arr = [() => 123];
      const resolved = $.resolve ( arr );

      isReadable ( t, resolved[0] );

      t.is ( resolved[0](), 123 );

    });

    it ( 'resolves a nested array', t => {

      const arr = [123, [() => 123]];
      const resolved = $.resolve ( arr );

      isReadable ( t, resolved[1][0] );

      t.is ( resolved[1][0](), 123 );

    });

    it ( 'resolves an observable', t => {

      const o = $(123);
      const resolved = $.resolve ( o );

      t.is ( resolved, o );

    });

    it ( 'resolves nested observable', t => {

      const a = $(123);
      const b = $(a);
      const resolved = $.resolve ( b );

      t.is ( resolved, b );
      t.is ( resolved (), a );

    });

    it ( 'resolves a plain object', t => {

      const ia = { foo: true };
      const ib = { foo: () => true };
      const ic = { foo: [() => true] };

      const oa = $.resolve ( ia );
      const ob = $.resolve ( ib );
      const oc = $.resolve ( ic );

      t.is ( oa, ia );
      t.is ( ob, ib );
      t.is ( oc, ic );

      t.false ( $.is ( ob.foo ) );
      t.false ( $.is ( oc.foo[0] ) );

    });

    it ( 'resolves a primitive', t => {

      const symbol = Symbol ();

      t.is ( $.resolve ( null ), null );
      t.is ( $.resolve ( undefined ), undefined );
      t.is ( $.resolve ( true ), true );
      t.is ( $.resolve ( false ), false );
      t.is ( $.resolve ( 123 ), 123 );
      t.is ( $.resolve ( 123n ), 123n );
      t.is ( $.resolve ( 'foo' ), 'foo' );
      t.is ( $.resolve ( symbol ), symbol );

    });

    it ( 'resolves a function', t => {

      const fn = () => 123;
      const resolved = $.resolve ( fn );

      isReadable ( t, resolved );

      t.is ( resolved (), 123 );

    });

    it ( 'resolves nested functions', t => {

      const fn = () => () => 123;
      const resolved = $.resolve ( fn );

      isReadable ( t, resolved );
      isReadable ( t, resolved () );

      t.is ( resolved ()(), 123 );

    });

    it ( 'resolves mixed nested arrays and functions', t => {

      const arr = [() => [() => 123]];
      const resolved = $.resolve ( arr );

      isReadable ( t, resolved[0] );
      isReadable ( t, resolved[0]()[0] );

      t.is ( resolved[0]()[0](), 123 );

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

    it ( 'returns non-functions as is', t => {

      const values = [0, -0, Infinity, NaN, 'foo', true, false, {}, [], Promise.resolve (), new Map (), new Set (), null, undefined, Symbol ()];

      for ( const value of values ) {

        t.is ( value, $.sample ( value ) );

      }

    });

    it ( 'supports getting without creating dependencies in a computed', t => {

      const a = $(1);
      const b = $(2);
      const c = $(3);
      const d = $(0);

      let calls = 0;

      $.computed ( () => {
        calls += 1;
        a ();
        a ();
        d ( $.sample ( () => b () ) );
        c ();
        c ();
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

    it ( 'supports getting without creating dependencies in an effect', t => {

      const a = $(1);
      const b = $(2);
      const c = $(3);
      const d = $(0);

      let calls = 0;

      $.effect ( () => {
        calls += 1;
        a ();
        a ();
        d ( $.sample ( () => b () ) );
        c ();
        c ();
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

    it ( 'works with functions containing a computed', t => {

      const o = $(0);

      let calls = 0;

      $.effect ( () => {

        calls += 1;

        $.sample ( () => {

          o ();

          $.computed ( () => {

            o ();

          });

          o ();

        });

      });

      t.is ( calls, 1 );

      o ( 1 );

      t.is ( calls, 1 );

    });

    it ( 'works with functions containing an effect', t => {

      const o = $(0);

      let calls = 0;

      $.effect ( () => {

        calls += 1;

        $.sample ( () => {

          o ();

          $.effect ( () => {

            o ();

          });

          o ();

        });

      });

      t.is ( calls, 1 );

      o ( 1 );

      t.is ( calls, 1 );

    });

    it ( 'works with functions containing a root', t => {

      const o = $(0);

      let calls = 0;

      $.effect ( () => {

        calls += 1;

        $.sample ( () => {

          o ();

          $.root ( () => {

            o ();

          });

          o ();

        });

      });

      t.is ( calls, 1 );

      o ( 1 );

      t.is ( calls, 1 );

    });


    it ( 'works on the top-level computation', t => {

      const o = $(0);

      let sequence = '';

      $.effect ( () => {

        sequence += 'p';

        $.sample ( () => {

          o ();

          $.effect ( () => {

            sequence += 'c';

            o ();

          });

        });

      });

      t.is ( sequence, 'pc' );

      o ( 1 );

      t.is ( sequence, 'pcc' );

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

    it ( 'treats 0 and -0 as the same value values', t => {

      const selected = $(0);
      const isSelected = $.selector ( selected );

      t.true ( isSelected ( 0 ) );
      t.true ( isSelected ( -0 ) );

    });

  });

  describe ( 'suspense', it => {

    it ( 'does not resolve values again when the condition changes but the reuslt case is the same', t => {

      let sequence = '';

      const condition = $(0);

      const value0 = () => {
        sequence += '0';
      };

      const value1 = () => {
        sequence += '1';
      };

      const valueDefault = () => {
        sequence += 'd';
      };

      $.suspense ( condition, [[0, value0], [1, value1], [valueDefault]] );

      condition ( 0 );

      t.is ( sequence, '01d' );

      condition ( 1 );
      condition ( 1 );

      t.is ( sequence, '01d' );

      condition ( 2 );
      condition ( 3 );

      t.is ( sequence, '01d' );

    });

    it ( 'resolves the value of a case before returning it', t => {

      const result = $.suspense ( 1, [[1, () => () => '1'], [2, '2'], [1, '1.1']] );

      isReadable ( t, result );
      isReadable ( t, result () );
      isReadable ( t, result ()() );

      t.is ( result ()()(), '1' );

    });

    it ( 'resolves the value of the default case before returning it', t => {

      const result = $.suspense ( 2, [[1, '1'], [() => () => 'default'], [2, '2'] [1, '1.1']] );

      isReadable ( t, result );
      isReadable ( t, result () );
      isReadable ( t, result ()() );

      t.is ( result ()()(), 'default' );

    });

    it ( 'returns a computed to matching case or the default case with a functional condition', t => {

      const o = $(1);

      const result = $.suspense ( o, [[1, '1'], [2, '2'], [1, '1.1'], ['default']] );

      t.is ( result (), '1' );

      o ( 2 );

      t.is ( result (), '2' );

      o ( 3 );

      t.is ( result (), 'default' );

    });

    it ( 'returns a computed to the value of the default case if no case before it matches', t => {

      const result = $.suspense ( 2, [[1, '1'], ['default'], [2, '2'] [1, '1.1']] );

      t.is ( result (), 'default' );

    });

    it ( 'returns a computed to the value of the first matching case', t => {

      const result1 = $.suspense ( 1, [[1, '1'], [2, '2'], [1, '1.1']] );

      t.is ( result1 (), '1' );

      const result2 = $.suspense ( 2, [[1, '1'], [2, '2'], [1, '1.1']] );

      t.is ( result2 (), '2' );

    });

    it ( 'returns a computed to undefined if no condition matches and there is no default case', t => {

      const result = $.suspense ( 1, [[2, '2'], [3, '3']] );

      t.is ( result (), undefined );

    });

    it ( 'treats 0 and -0 as different values', t => {

      const condition = $(0);

      const computed = $.suspense ( condition, [[0, '0'], [-0, '-0']] );

      t.is ( computed (), '0' );

      condition ( -0 );

      t.is ( computed (), '-0' );

    });

  });

  describe ( 'switch', it => {

    it ( 'does not resolve values again when the condition changes but the reuslt case is the same', t => {

      let sequence = '';

      const condition = $(0);

      const value0 = () => {
        sequence += '0';
      };

      const value1 = () => {
        sequence += '1';
      };

      const valueDefault = () => {
        sequence += 'd';
      };

      $.switch ( condition, [[0, value0], [1, value1], [valueDefault]] );

      condition ( 0 );

      t.is ( sequence, '0' );

      condition ( 1 );
      condition ( 1 );

      t.is ( sequence, '01' );

      condition ( 2 );
      condition ( 3 );

      t.is ( sequence, '01d' );

    });

    it ( 'resolves the value of a case before returning it', t => {

      const result = $.switch ( 1, [[1, () => () => '1'], [2, '2'], [1, '1.1']] );

      isReadable ( t, result );
      isReadable ( t, result () );
      isReadable ( t, result ()() );

      t.is ( result ()()(), '1' );

    });

    it ( 'resolves the value of the default case before returning it', t => {

      const result = $.switch ( 2, [[1, '1'], [() => () => 'default'], [2, '2'] [1, '1.1']] );

      isReadable ( t, result );
      isReadable ( t, result () );
      isReadable ( t, result ()() );

      t.is ( result ()()(), 'default' );

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

    it ( 'treats 0 and -0 as different values', t => {

      const condition = $(0);

      const computed = $.switch ( condition, [[0, '0'], [-0, '-0']] );

      t.is ( computed (), '0' );

      condition ( -0 );

      t.is ( computed (), '-0' );

    });

  });

  describe ( 'ternary', it => {

    it ( 'does not resolve values again when the condition changes but the reuslt branch is the same', t => {

      let sequence = '';

      const condition = $(1);

      const valueTrue = () => {
        sequence += 't';
      };

      const valueFalse = () => {
        sequence += 'f';
      };

      $.ternary ( condition, valueTrue, valueFalse );

      condition ( 2 );
      condition ( 3 );

      t.is ( sequence, 't' );

      condition ( 0 );
      condition ( false );

      t.is ( sequence, 'tf' );

      condition ( 4 );
      condition ( 5 );

      t.is ( sequence, 'tft' );

    });

    it ( 'resolves the first value before returning it', t => {

      const result = $.ternary ( true, () => () => 123, 321 );

      isReadable ( t, result );
      isReadable ( t, result () );
      isReadable ( t, result ()() );

      t.is ( result ()()(), 123 );

    });

    it ( 'resolves the second value before returning it', t => {

      const result = $.ternary ( false, 123, () => () => 321 );

      isReadable ( t, result );
      isReadable ( t, result () );
      isReadable ( t, result ()() );

      t.is ( result ()()(), 321 );

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

  describe ( 'tryCatch', it => {

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

      const computed = $.tryCatch ( regular, fallback );

      t.is ( computed ()(), 'regular' );

      o ( true );

      t.true ( err instanceof Error );
      t.is ( err.message, 'whoops' );

      t.is ( computed (), 'fallback' );

      o ( false );

      recover ();

      t.is ( computed ()(), 'regular' );

    });

    it ( 'casts thrown errors to Error instances', t => {

      const fallback = ({ error }) => {
        t.true ( error instanceof Error );
        t.is ( error.message, 'err' );
      };

      const regular = () => {
        throw 'err';
      };

      $.tryCatch ( regular, fallback );

    });

    it ( 'resolves the fallback before returning it', t => {

      const result = $.tryCatch ( () => { throw 'err' }, () => () => () => 123 );

      isReadable ( t, result );
      isReadable ( t, result () );
      isReadable ( t, result ()() );

      t.is ( result ()()(), 123 );

    });

    it ( 'resolves the value before returning it', t => {

      const result = $.tryCatch ( () => () => 123, () => {} );

      isReadable ( t, result );
      isReadable ( t, result () );
      isReadable ( t, result ()() );

      t.is ( result ()()(), 123 );

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
