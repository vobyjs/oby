
/* IMPORT */

import {describe} from 'fava';
import {setTimeout as delay} from 'node:timers/promises';
import $ from '../../dist/index.js';
import {observable} from '../../dist/index.js';

/* HELPERS */

const isReadable = ( t, value ) => {

  t.true ( $.isObservable ( value ) );
  t.true ( typeof value.read === 'undefined' );
  t.true ( typeof value.write === 'undefined' );
  t.true ( typeof value.value === 'undefined' );
  t.true ( typeof value.bind === 'function' );
  t.true ( typeof value.apply === 'function' );

  t.throws ( () => value ( Math.random () ), { message: 'A readonly Observable can not be updated' } );

};

const isWritable = ( t, value ) => {

  t.true ( $.isObservable ( value ) );
  t.true ( typeof value.read === 'undefined' );
  t.true ( typeof value.write === 'undefined' );
  t.true ( typeof value.value === 'undefined' );
  t.true ( typeof value.bind === 'function' );
  t.true ( typeof value.apply === 'function' );

};

/* MAIN */

describe ( 'oby', () => {

  describe ( '$', it => {

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

    it ( 'creates a dependency in a memo when getting', t => {

      const o = $(1);

      let calls = 0;

      $.memo ( () => {
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

    it ( 'creates a dependency in a reaction when getting', t => {

      const o = $(1);

      let calls = 0;

      $.reaction ( () => {
        calls += 1;
        o ();
      });

      t.is ( calls, 1 );

      o ( 2 );

      t.is ( calls, 2 );

      o ( 3 );

      t.is ( calls, 3 );

    });

    it ( 'creates a single dependency in a memo even if getting multiple times', t => {

      const o = $(1);

      let calls = 0;

      $.memo ( () => {
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

    it ( 'creates a single dependency in a reaction even if getting multiple times', t => {

      const o = $(1);

      let calls = 0;

      $.reaction ( () => {
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

    it ( 'does not create a dependency in a memo when setting', t => {

      let o;
      let calls = 0;

      $.memo ( () => {
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

    it ( 'does not create a dependency in a reaction when setting', t => {

      let o;
      let calls = 0;

      $.reaction ( () => {
        calls += 1;
        o = $(1);
      });

      t.is ( calls, 1 );

      o ( 2 );

      t.is ( calls, 1 );

    });

    it ( 'does not create a dependency in a memo when setting with a function', t => {

      const o = $(1);

      let calls = 0;

      $.memo ( () => {
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

      $.effect ( () => {
        calls += 1;
        o ( prev => prev + 1 );
        o ( prev => prev + 1 );
        o ( prev => prev + 1 );
      });

      t.is ( calls, 1 );

      o ( 5 );

      t.is ( calls, 1 );

    });

    it ( 'does not create a dependency in a reaction when setting with a function', t => {

      const o = $(1);

      let calls = 0;

      $.reaction ( () => {
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

      $.memo ( () => {
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

        const c = $.memo ( () => {
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

      $.memo ( () => {
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

    it ( 'coalesces multiple updates for a memo together', t => {

      const a = $(0);
      const b = $(0);

      let calls = 0;

      $.memo ( () => {

        calls += 1;

        a ();
        b ();

      });

      t.is ( calls, 1 );

      $.batch ( () => {
        a ( 1 );
        a ( 2 );
        b ( 1 );
        b ( 2 );
      });

      t.is ( calls, 2 );

    });

    it ( 'coalesces multiple updates for an effect together', t => {

      const a = $(0);
      const b = $(0);

      let calls = 0;

      $.effect ( () => {

        calls += 1;

        a ();
        b ();

      });

      t.is ( calls, 1 );

      $.batch ( () => {
        a ( 1 );
        a ( 2 );
        b ( 1 );
        b ( 2 );
      });

      t.is ( calls, 2 );

    });

    it ( 'coalesces multiple updates for a reaction together', t => {

      const a = $(0);
      const b = $(0);

      let calls = 0;

      $.reaction ( () => {

        calls += 1;

        a ();
        b ();

      });

      t.is ( calls, 1 );

      $.batch ( () => {
        a ( 1 );
        a ( 2 );
        b ( 1 );
        b ( 2 );
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

    it ( 'does not cause the parent memo to re-execute', t => {

      const disposed = $(false);

      let calls = 0;

      $.memo ( () => {

        calls += 1;

        if ( disposed () ) return;

        const o = $(0);

        o ();

        $.cleanup ( () => {

          o ( Math.random () );

        });

      });

      disposed ( true );

      t.is ( calls, 2 );

    });

    it ( 'does not cause the parent effect to re-execute', t => {

      const disposed = $(false);

      let calls = 0;

      $.effect ( () => {

        calls += 1;

        if ( disposed () ) return;

        const o = $(0);

        o ();

        $.cleanup ( () => {

          o ( Math.random () );

        });

      });

      disposed ( true );

      t.is ( calls, 2 );

    });

    it ( 'does not cause the parent reaction to re-execute', t => {

      const disposed = $(false);

      let calls = 0;

      $.reaction ( () => {

        calls += 1;

        if ( disposed () ) return;

        const o = $(0);

        o ();

        $.cleanup ( () => {

          o ( Math.random () );

        });

      });

      disposed ( true );

      t.is ( calls, 2 );

    });

    it ( 'registers a function to be called when the parent computation is disposed', t => {

      let sequence = '';

      $.root ( dispose => {

        $.memo ( () => {

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

      $.memo ( () => {

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

    it ( 'registers a function to be called when the parent reaction updates', t => {

      const o = $(0);

      let sequence = '';

      $.reaction ( () => {

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

    it ( 'registers a function to be called when the parent suspense is disposed', t => {

      let sequence = '';

      $.root ( dispose => {

        $.suspense ( false, () => {

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

    it ( 'returns undefined', t => {

      const result1 = $.cleanup ( () => {} );
      const result2 = $.cleanup ( () => {} );

      t.is ( result1, undefined );
      t.is ( result2, undefined );

    });

    it ( 'supports a callable object', t => {

      const o = $(0);

      let sequence = '';

      $.effect ( () => {

        o ();

        const onCleanupA = {
          call: thiz => {
            sequence += 'a';
            t.is ( thiz, onCleanupA );
          }
        };

        const onCleanupB = {
          call: thiz => {
            sequence += 'b';
            t.is ( thiz, onCleanupB );
          }
        };

        $.cleanup ( onCleanupA );

        $.cleanup ( onCleanupB );

      });

      t.is ( sequence, '' );

      o ( 1 );

      t.is ( sequence, 'ab' );

      o ( 2 );

      t.is ( sequence, 'abab' );

      o ( 3 );

      t.is ( sequence, 'ababab' );

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

    it ( 'can read and write context values inside a memo', t => {

      $.memo ( () => {

        const ctx = Symbol ();
        const value = { foo: 123 };

        $.context ( ctx, value );

        t.is ( $.context ( ctx ), value );

      });

    });

    it ( 'can read and write context values inside a reaction', t => {

      $.reaction ( () => {

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

    it ( 'can read and write context values inside a suspense', t => {

      $.suspense ( false, () => {

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

    it ( 'can read and write context values inside a deep memo', t => {

      $.memo ( () => {

        const ctx = Symbol ();
        const value = { foo: 123 };

        $.context ( ctx, value );

        $.memo ( () => {

          t.is ( $.context ( ctx ), value );

        });

      });

    });

    it ( 'can read and write context values inside a deep reaction', t => {

      $.reaction ( () => {

        const ctx = Symbol ();
        const value = { foo: 123 };

        $.context ( ctx, value );

        $.reaction ( () => {

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

    it ( 'can read and write context values inside a deep suspense', t => {

      $.suspense ( false, () => {

        const ctx = Symbol ();
        const value = { foo: 123 };

        $.context ( ctx, value );

        $.suspense ( false, () => {

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

        if ( !$.untrack ( a ) ) a ( a () + 1 );

        b ();

      });

      t.is ( calls, 2 );

      a ( 2 );

      t.is ( calls, 2 );

      b ( 1 );

      t.is ( calls, 3 );

    });

    it ( 'cleans up inner effects', t => {

      const o = $(0);
      const active = $(true);

      let calls = 0;

      $.effect ( () => {

        if ( !active () ) return;

        $.effect ( () => {

          calls += 1;

          o ();

        });

      });

      t.is ( calls, 1 );

      active ( false );
      o ( 1 );

      t.is ( calls, 1 );

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

    it ( 'throws if it receives an async function', t => {

      t.throws ( () => {

        $.effect ( async () => {} );

      }, { message: 'A computation is forbidden from executing an async function' } );

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

      $.memo ( () => {

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

    it ( 'casts an error thrown inside a parent reaction to an Error instance', t => {

      $.reaction ( () => {

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

    it ( 'casts an error thrown inside a parent suspense to an Error instance', t => {

      $.suspense ( false, () => {

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

      $.memo ( () => {

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

    it ( 'registers a function to be called when the parent reaction throws', t => {

      const o = $(0);

      let sequence = '';

      $.reaction ( () => {

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

    it ( 'registers a function to be called when the parent suspense throws', t => {

      let sequence = '';

      $.suspense ( false, () => {

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

      $.memo ( () => {

        $.error ( () => {
          sequence += 'a';
        });

        $.error ( () => {
          sequence += 'b';
        });

        $.memo ( () => {

          $.memo ( () => {

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

    it ( 'registers a function to be called when a child reaction throws', t => {

      const o = $(0);

      let sequence = '';

      $.reaction ( () => {

        $.error ( () => {
          sequence += 'a';
        });

        $.error ( () => {
          sequence += 'b';
        });

        $.reaction ( () => {

          $.reaction ( () => {

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

    it ( 'registers a function to be called when a child suspense throws', t => {

      let sequence = '';

      $.suspense ( false, () => {

        $.error ( () => {
          sequence += 'a';
        });

        $.error ( () => {
          sequence += 'b';
        });

        $.suspense ( false, () => {

          throw 'err';

        });

      });

      t.is ( sequence, 'ab' );

    });

    it ( 'returns undefined', t => {

      const result1 = $.error ( error => { throw error; } );
      const result2 = $.error ( error => { throw error; } );

      t.is ( result1, undefined );
      t.is ( result2, undefined );

    });

    it ( 'supports a callable object', t => {

      const o = $(0);

      let sequence = '';

      $.effect ( () => {

        const onErrorA = {
          call: thiz => {
            sequence += 'a';
            t.is ( thiz, onErrorA );
          }
        };

        const onErrorB = {
          call: thiz => {
            sequence += 'b';
            t.is ( thiz, onErrorB );
          }
        };

        $.error ( onErrorA );

        $.error ( onErrorB );

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

    it ( 'throws if the error handler in a computation throws', t => {

      t.throws ( () => {

        $.memo ( () => {

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

    it ( 'throws if the error handler in an reaction throws', t => {

      t.throws ( () => {

        $.reaction ( () => {

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

    it ( 'throws if the error handler in a suspense throws', t => {

      t.throws ( () => {

        $.suspense ( false, () => {

          $.error ( () => {
            throw new Error ( 'Inner error' );
          });

          throw 'err';

        });

      }, { message: 'Inner error' } );

    });

  });

  describe ( 'for', it => {

    it ( 'calls the mapper function with an observable to the index too', t => {

      const array = $([ 'a', 'b', 'c' ]);
      const argsRaw = [];
      const args = [];

      $.for ( array, ( value, index ) => {
        isReadable ( t, index );
        argsRaw.push ( index );
        args.push ( index () );
      });

      t.deepEqual ( argsRaw.map ( a => a () ), [0, 1, 2] );
      t.deepEqual ( args, [0, 1, 2] );

      array ([ 'a', 'b', 'c', 'd' ]);

      t.deepEqual ( argsRaw.map ( a => a () ), [0, 1, 2, 3] );
      t.deepEqual ( args, [0, 1, 2, 3] );

      array ([ 'd', 'c', 'a', 'b' ]);

      t.deepEqual ( argsRaw.map ( a => a () ), [2, 3, 1, 0] );
      t.deepEqual ( args, [0, 1, 2, 3] );

    });

    it ( 'disposes of any reactivity when the values array is emptied', t => {

      const array = $([1, 2, 3]);
      const args = [];

      $.for ( array, value => {
        $.cleanup ( () => {
          args.push ( value );
        });
      });

      array ( [] );

      t.deepEqual ( args, [1, 2, 3] );

    });

    it ( 'disposes of any reactivity when the parent computation is disposed', t => {

      const o1 = $(1);
      const o2 = $(2);
      const array = $([o1, o2]);
      const args = [];

      const dispose = $.root ( dispose => {
        $.memo ( () => {
          $.for ( array, value => {
            $.memo ( () => {
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
            $.memo ( () => {
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

    it ( 'disposes of any reactivity when the parent reaction is disposed', t => {

      const o1 = $(1);
      const o2 = $(2);
      const array = $([o1, o2]);
      const args = [];

      const dispose = $.root ( dispose => {
        $.reaction ( () => {
          $.for ( array, value => {
            $.memo ( () => {
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
          $.memo ( () => {
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
        $.memo ( () => {
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

    it ( 'disposes of any reactivity created for duplicated items', t => {

      const o = $(1);
      const array = $([o, o]);
      const args = [];

      $.for ( array, value => {
        $.memo ( () => {
          args.push ( value () );
        });
      });

      t.deepEqual ( args, [1, 1] );

      o ( 11 );

      t.deepEqual ( args, [1, 1, 11, 11] );

      o ( 22 );

      t.deepEqual ( args, [1, 1, 11, 11, 22, 22] );

      array ([ o ]);

      t.deepEqual ( args, [1, 1, 11, 11, 22, 22] );

      o ( 111 );

      t.deepEqual ( args, [1, 1, 11, 11, 22, 22, 111] );

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

    it ( 'returns a memo to an empty array for an empty array and missing fallback', t => {

      t.deepEqual ( $.for ( [], () => () => 123 )(), [] );

    });

    it ( 'returns a memo to fallback for an empty array and a provided fallback', t => {

      t.is ( $.for ( [], () => () => 123, 123 )(), 123 );

    });

    it ( 'works with an array of non-unique values', t => {

      const array = $([ 1, 1, 2 ]);
      const args = [];

      $.for ( array, value => {
        $.memo ( () => {
          args.push ( value );
        });
      });

      t.deepEqual ( args, [1, 1, 2] );

      array ([ 2, 2, 1 ]);

      t.deepEqual ( args, [1, 1, 2, 2] );

    });

  });

  describe ( 'forIndex', it => {

    it ( 'calls the mapper function with the index too', t => {

      const array = $([ 'a', 'b', 'c' ]);
      const args = [];

      $.forIndex ( array, ( value, index ) => {
        args.push ( index );
      });

      t.deepEqual ( args, [0, 1, 2] );

      array ([ 'a', 'b', 'c', 'd' ]);

      t.deepEqual ( args, [0, 1, 2, 3] );

    });

    it ( 'disposes of any reactivity when the values array is emptied', t => {

      const array = $([1, 2, 3]);
      const args = [];

      $.forIndex ( array, value => {
        $.cleanup ( () => {
          args.push ( value () );
        });
      });

      array ( [] );

      t.deepEqual ( args, [1, 2, 3] );

    });

    it ( 'disposes of any reactivity when the parent computation is disposed', t => {

      const array = $([ 1, 2 ]);
      const args = [];

      const dispose = $.root ( dispose => {
        $.memo ( () => {
          $.forIndex ( array, value => {
            $.memo ( () => {
              args.push ( value () );
            });
          });
        });
        return dispose;
      });

      dispose ();

      t.deepEqual ( args, [1, 2] );

      array ([ 11, 22 ]);

      t.deepEqual ( args, [1, 2] );

    });

    it ( 'disposes of any reactivity when the parent effect is disposed', t => {

      const array = $([ 1, 2 ]);
      const args = [];

      const dispose = $.root ( dispose => {
        $.effect ( () => {
          $.forIndex ( array, value => {
            $.memo ( () => {
              args.push ( value () );
            });
          });
        });
        return dispose;
      });

      dispose ();

      t.deepEqual ( args, [1, 2] );

      array ([ 11, 22 ]);

      t.deepEqual ( args, [1, 2] );

    });

    it ( 'disposes of any reactivity when the parent reaction is disposed', t => {

      const array = $([ 1, 2 ]);
      const args = [];

      const dispose = $.root ( dispose => {
        $.reaction ( () => {
          $.forIndex ( array, value => {
            $.memo ( () => {
              args.push ( value () );
            });
          });
        });
        return dispose;
      });

      dispose ();

      t.deepEqual ( args, [1, 2] );

      array ([ 11, 22 ]);

      t.deepEqual ( args, [1, 2] );

    });

    it ( 'disposes of any reactivity when the parent root is disposed', t => {

      const array = $([ 1, 2 ]);
      const args = [];

      const dispose = $.root ( dispose => {
        $.forIndex ( array, value => {
          $.memo ( () => {
            args.push ( value () );
          });
        });
        return dispose;
      });

      dispose ();

      t.deepEqual ( args, [1, 2] );

      array ([ 11, 22 ]);

      t.deepEqual ( args, [1, 2] );

    });

    it ( 'disposes of any reactivity created for indexes that got deleted', t => {

      const o = $(0);
      const array = $([ 1, 2 ]);
      const args = [];

      $.forIndex ( array, value => {
        $.memo ( () => {
          o ();
          args.push ( value () );
        });
      });

      t.deepEqual ( args, [1, 2] );

      array ([ 11, 2 ]);

      t.deepEqual ( args, [1, 2, 11] );

      array ([ 11, 22 ]);

      t.deepEqual ( args, [1, 2, 11, 22] );

      array ([ 11 ]);

      t.deepEqual ( args, [1, 2, 11, 22] );

      o ( 1 );

      t.deepEqual ( args, [1, 2, 11, 22, 11] );

    });

    it ( 'renders results for unknown indexes', t => {

      const array = $([ 1, 2, 3 ]);
      const args = [];

      $.forIndex ( array, value => {
        args.push ( value () );
      });

      t.deepEqual ( args, [1, 2, 3] );

      array ([ 1, 2, 3, 4 ]);

      t.deepEqual ( args, [1, 2, 3, 4] );

      array ([ 1, 2, 3, 4, 5 ]);

      t.deepEqual ( args, [1, 2, 3, 4, 5] );

    });

    it ( 'renders results for updated values', t => {

      const array = $([ 1, 2, 3 ]);
      const args = [];

      $.forIndex ( array, value => {
        return $.memo ( () => {
          args.push ( value () );
        });
      });

      t.deepEqual ( args, [1, 2, 3] );

      array ([ 3, 2, 1 ]);

      t.deepEqual ( args, [1, 2, 3, 3, 1] );

    });

    it ( 'resolves the fallback value before returning it', t => {

      const result = $.forIndex ( [], () => () => 123, () => () => 321 );

      isReadable ( t, result );
      isReadable ( t, result () );
      isReadable ( t, result ()() );

      t.is ( result ()()(), 321 );

    });

    it ( 'resolves the mapped value before returning it', t => {

      const result = $.forIndex ( [1], () => () => () => 123 );

      isReadable ( t, result );
      isReadable ( t, result ()[0] );
      isReadable ( t, result ()[0]() );

      t.is ( result ()[0]()(), 123 );

    });

    it ( 'returns a memo to an empty array for an empty array and missing fallback', t => {

      t.deepEqual ( $.forIndex ( [], () => () => 123 )(), [] );

    });

    it ( 'returns a memo to fallback for an empty array and a provided fallback', t => {

      t.is ( $.forIndex ( [], () => () => 123, 123 )(), 123 );

    });

    it ( 'unwraps observables in the input', t => {

      const o1 = $(1);
      const o2 = $(2);
      const array = $([ o1, o2, 3 ]);
      const args = [];

      $.forIndex ( array, value => {
        $.memo ( () => {
          args.push ( value () );
        });
      });

      t.deepEqual ( args, [1, 2, 3] );

      o1 ( 11 );

      t.deepEqual ( args, [1, 2, 3, 11] );

      o2 ( 22 );

      t.deepEqual ( args, [1, 2, 3, 11, 22] );

      array ([ 11, 22, 3 ]);

      t.deepEqual ( args, [1, 2, 3, 11, 22] );

    });

    it ( 'works with an array of non-unique values', t => {

      const array = $([ 1, 1, 2 ]);
      const args = [];

      $.forIndex ( array, value => {
        $.memo ( () => {
          args.push ( value () );
        });
      });

      t.deepEqual ( args, [1, 1, 2] );

      array ([ 2, 2, 1 ]);

      t.deepEqual ( args, [1, 1, 2, 2, 2, 1] );

    });

  });

  describe ( 'forValue', it => {

    it ( 'calls the mapper function with an observable to the index', t => {

      const array = $([ 'a', 'b', 'c' ]);
      const argsRaw = [];
      const args = [];

      $.forValue ( array, ( value, index ) => {
        isReadable ( t, index );
        argsRaw.push ( index );
        args.push ( index () );
      });

      t.deepEqual ( argsRaw.map ( a => a () ), [0, 1, 2] );
      t.deepEqual ( args, [0, 1, 2] );

      array ([ 'a', 'b', 'c', 'd' ]);

      t.deepEqual ( argsRaw.map ( a => a () ), [0, 1, 2, 3] );
      t.deepEqual ( args, [0, 1, 2, 3] );

      array ([ 'd', 'c', 'a', 'b' ]);

      t.deepEqual ( argsRaw.map ( a => a () ), [2, 3, 1, 0] );
      t.deepEqual ( args, [0, 1, 2, 3] );

    });

    it ( 'calls the mapper function with an observable to the value', t => {

      const array = $([ 'a', 'b', 'c' ]);
      const argsRaw = [];
      const args = [];

      $.forValue ( array, ( value ) => {
        isReadable ( t, value );
        argsRaw.push ( value );
        args.push ( value () );
      });

      t.deepEqual ( argsRaw.map ( a => a () ), ['a', 'b', 'c'] );
      t.deepEqual ( args, ['a', 'b', 'c'] );

      array ([ 'a', 'b', 'c', 'd' ]);

      t.deepEqual ( argsRaw.map ( a => a () ), ['a', 'b', 'c', 'd'] );
      t.deepEqual ( args, ['a', 'b', 'c', 'd'] );

      array ([ 'e', 'b', 'c', 'd' ]);

      t.deepEqual ( argsRaw.map ( a => a () ), ['e', 'b', 'c', 'd'] );
      t.deepEqual ( args, ['a', 'b', 'c', 'd'] );

    });

    it ( 'disposes of any reactivity when the values array is emptied', t => {

      const array = $([1, 2, 3]);
      const args = [];

      $.forValue ( array, value => {
        $.cleanup ( () => {
          args.push ( value () );
        });
      });

      array ( [] );

      t.deepEqual ( args, [1, 2, 3] );

    });

    it ( 'disposes of any reactivity when the parent computation is disposed', t => {

      const o1 = $(1);
      const o2 = $(2);
      const array = $([o1, o2]);
      const args = [];

      const dispose = $.root ( dispose => {
        $.memo ( () => {
          $.forValue ( array, value => {
            $.memo ( () => {
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
          $.forValue ( array, value => {
            $.memo ( () => {
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

    it ( 'disposes of any reactivity when the parent reaction is disposed', t => {

      const o1 = $(1);
      const o2 = $(2);
      const array = $([o1, o2]);
      const args = [];

      const dispose = $.root ( dispose => {
        $.reaction ( () => {
          $.forValue ( array, value => {
            $.memo ( () => {
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
        $.forValue ( array, value => {
          $.memo ( () => {
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

      $.forValue ( array, value => {
        $.memo ( () => {
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

    it ( 'disposes of any reactivity created for duplicated items', t => {

      const o = $(1);
      const array = $([o, o]);
      const args = [];

      $.forValue ( array, value => {
        $.memo ( () => {
          args.push ( value () );
        });
      });

      t.deepEqual ( args, [1, 1] );

      o ( 11 );

      t.deepEqual ( args, [1, 1, 11, 11] );

      o ( 22 );

      t.deepEqual ( args, [1, 1, 11, 11, 22, 22] );

      array ([ o ]);

      t.deepEqual ( args, [1, 1, 11, 11, 22, 22] );

      o ( 111 );

      t.deepEqual ( args, [1, 1, 11, 11, 22, 22, 111] );

    });

    it ( 'renders only results for unknown values', t => {

      const array = $([1, 2, 3]);
      const args = [];

      $.forValue ( array, value => {
        args.push ( value () );
      });

      t.deepEqual ( args, [1, 2, 3] );

      array ([ 1, 2, 3, 4 ]);

      t.deepEqual ( args, [1, 2, 3, 4] );

      array ([ 1, 2, 3, 4, 5 ]);

      t.deepEqual ( args, [1, 2, 3, 4, 5] );

    });

    it ( 'reuses leftover items if possible', t => {

      const array = $([1, 2, 3]);
      const argsRaw = [];
      const args = [];

      $.forValue ( array, value => {
        argsRaw.push ( value );
        args.push ( value () );
      });

      t.deepEqual ( argsRaw.map ( a => a () ), [1, 2, 3] );
      t.deepEqual ( args, [1, 2, 3] );

      array ([ 1, 3, 4, 5 ]);

      t.deepEqual ( argsRaw.map ( a => a () ), [1, 4, 3, 5] );
      t.deepEqual ( args, [1, 2, 3, 5] );

    });

    it ( 'resolves the fallback value before returning it', t => {

      const result = $.forValue ( [], () => () => 123, () => () => 321 );

      isReadable ( t, result );
      isReadable ( t, result () );
      isReadable ( t, result ()() );

      t.is ( result ()()(), 321 );

    });

    it ( 'resolves the mapped value before returning it', t => {

      const result = $.forValue ( [1], () => () => () => 123 );

      isReadable ( t, result );
      isReadable ( t, result ()[0] );
      isReadable ( t, result ()[0]() );

      t.is ( result ()[0]()(), 123 );

    });

    it ( 'returns a memo to an empty array for an empty array and missing fallback', t => {

      t.deepEqual ( $.forValue ( [], () => () => 123 )(), [] );

    });

    it ( 'returns a memo to fallback for an empty array and a provided fallback', t => {

      t.is ( $.forValue ( [], () => () => 123, 123 )(), 123 );

    });

    it ( 'works with an array of non-unique values', t => {

      const array = $([ 1, 1, 2 ]);
      const args = [];

      $.forValue ( array, value => {
        $.memo ( () => {
          args.push ( value () );
        });
      });

      t.deepEqual ( args, [1, 1, 2] );

      array ([ 2, 2, 1 ]);

      t.deepEqual ( args, [1, 1, 2, 2] );

    });

  });

  describe ( 'get', it => {

    it ( 'creates a dependency in a memo', t => {

      const o = $(1);

      let calls = 0;

      $.memo ( () => {
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

    it ( 'creates a dependency in an reaction', t => {

      const o = $(1);

      let calls = 0;

      $.reaction ( () => {
        calls += 1;
        $.get ( o );
      });

      t.is ( calls, 1 );

      o ( 2 );

      t.is ( calls, 2 );

      o ( 3 );

      t.is ( calls, 3 );

    });

    it ( 'gets the value out of a function', t => {

      const o = () => 123;

      t.is ( $.get ( o ), 123 );

    });

    it ( 'gets the value out of an observable', t => {

      const o = $(123);

      t.is ( $.get ( o ), 123 );

    });

    it ( 'gets the value out of a non-function and non-observable', t => {

      t.is ( $.get ( 123 ), 123 );

    });

    it ( 'gets, optionally, the value out only of an observable', t => {

      const fn = () => 123;
      const o = $(123);

      t.is ( $.get ( fn, false ), fn );
      t.is ( $.get ( o, false ), 123 );

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

    it ( 'returns a memo to the value or undefined with a functional condition', t => {

      const o = $(false);

      const result = $.if ( o, 123 );

      t.is ( result (), undefined );

      o ( true );

      t.is ( result (), 123 );

      o ( false );

      t.is ( result (), undefined );

    });

    it ( 'returns a memo to the value with a truthy condition', t => {

      t.is ( $.if ( true, 123 )(), 123 );
      t.is ( $.if ( 'true', 123 )(), 123 );

    });

    it ( 'returns a memo to the value with a falsy condition', t => {

      t.is ( $.if ( false, 123 )(), undefined );
      t.is ( $.if ( 0, 123 )(), undefined );

    });

    it ( 'returns a memo to undefined for a falsy condition and missing fallback', t => {

      t.is ( $.if ( false, 123 )(), undefined );

    });

    it ( 'returns a memo to fallback for a falsy condition and a provided fallback', t => {

      t.is ( $.if ( false, 123, 321 )(), 321 );

    });

  });

  describe ( 'isObservable', it => {

    it ( 'checks if a value is an observable', t => {

      t.true ( $.isObservable ( $() ) );
      t.true ( $.isObservable ( $(123) ) );
      t.true ( $.isObservable ( $(false) ) );
      t.true ( $.isObservable ( $.memo ( () => {} ) ) );

      t.false ( $.isObservable () );
      t.false ( $.isObservable ( null ) );
      t.false ( $.isObservable ( {} ) );
      t.false ( $.isObservable ( [] ) );
      t.false ( $.isObservable ( $.effect ( () => {} ) ) );

    });

  });

  describe ( 'isStore', it => {

    it ( 'checks if a value is a store', t => {

      t.true ( $.isStore ( $.store ( {} ) ) );
      t.true ( $.isStore ( $.store ( [] ) ) );

      t.false ( $.isStore () );
      t.false ( $.isStore ( null ) );
      t.false ( $.isStore ( {} ) );
      t.false ( $.isStore ( [] ) );

    });

  });

  describe ( 'memo', it => {

    it ( 'can not be running multiple times concurrently', t => {

      const o = $(0);

      let executions = 0;

      const result = $.memo ( () => {

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

      $.memo ( () => {

        calls += 1;

        if ( !$.untrack ( a ) ) a ( a () + 1 );

        b ();

      });

      t.is ( calls, 2 );

      a ( 2 );

      t.is ( calls, 2 );

      b ( 1 );

      t.is ( calls, 3 );

    });

    it ( 'cleans up inner memos', t => {

      const o = $(0);
      const active = $(true);

      let calls = 0;

      $.memo ( () => {

        if ( !active () ) return;

        $.memo ( () => {

          calls += 1;

          o ();

        });

      });

      t.is ( calls, 1 );

      active ( false );
      o ( 1 );

      t.is ( calls, 1 );

    });

    it ( 'does not throw when disposing of itself', t => {

      t.notThrows ( () => {

        $.root ( dispose => {

          $.memo ( () => {

            dispose ();

            return 1;

          });

        });

      });

    });

    it ( 'returns a readable observable', t => {

      const o = $.memo ( () => {} );

      isReadable ( t, o );

    });

    it ( 'returns an observable with the return of the function', t => {

      const a = $(1);
      const b = $(2);
      const c = $.memo ( () => a () + b () );

      t.true ( $.isObservable ( c ) );
      t.is ( c (), 3 );

    });

    it ( 'returns an observable with value undefined if the function does not return anything', t => {

      const o = $.memo ( () => {} );

      t.true ( $.isObservable ( o ) );
      t.is ( o (), undefined );

    });

    it ( 'supports a custom equality function', t => {

      const o = $(2);
      const equals = value => ( value % 2 === 0 );
      const oPlus1 = $.memo ( () => o () + 1, { equals } );

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
      const c = $.memo ( () => bool () ? a () : b () );

      t.is ( c (), 2 );

      bool ( true );

      t.is ( c (), 1 );

    });

    it ( 'supports manually registering a function to be called when the parent computation updates', t => {

      const o = $(0);

      let sequence = '';

      $.memo ( () => {

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

      $.memo ( () => {

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

    it ( 'throws if it receives an async function', t => {

      t.throws ( () => {

        $.memo ( async () => {} );

      }, { message: 'A computation is forbidden from executing an async function' } );

    });

    it ( 'updates the observable with the last value when causing itself to re-execute', t => {

      const o = $(0);

      const memo = $.memo ( () => {

        let value = o ();

        if ( !o () ) o ( 1 );

        return value;

      });

      t.is ( memo (), 1 );

    });

    it ( 'updates the observable when the dependencies change', t => {

      const a = $(1);
      const b = $(2);
      const c = $.memo ( () => a () + b () );

      a ( 3 );
      b ( 7 );

      t.is ( c (), 10 );

    });

    it ( 'updates the observable when the dependencies change inside other computations', t => {

      const a = $(0);
      const b = $(0);
      let calls = 0;

      $.memo ( () => {
        calls += 1;
        a ();
      });

      t.is ( calls, 1 );

      $.memo ( () => {
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

  describe ( 'observable', it => {

    it ( 'is both a getter and a setter', t => {

      const o = observable ();

      t.is ( o (), undefined );

      o ( 123 );

      t.is ( o (), 123 );

      o ( 321 );

      t.is ( o (), 321 );

      o ( undefined );

      t.is ( o (), undefined );

    });

  });

  describe ( 'off', it => {

    it ( 'can unregister a previously registered function', t => {

      const o = $(0);

      let calls = 0;

      const onChange = () => calls++;

      $.on ( o, onChange );

      t.is ( calls, 1 );

      $.off ( o, onChange );

      o ( 1 );
      o ( 2 );
      o ( 3 );

      t.is ( calls, 1 );

      $.on ( o, onChange );

      t.is ( calls, 2 );

    });

    it ( 'returns undefined', t => {

      const o = $(0);

      let calls = 0;

      const onChange = () => calls++;

      $.on ( o, onChange );

      t.is ( calls, 1 );

      const result = $.off ( o, onChange );

      t.is ( result, undefined );

    });

    it ( 'returns undefined for already urnegistered functions too', t => {

      const o = $(0);

      const result = $.off ( o, () => {} );

      t.is ( result, undefined );

    });

    it ( 'supports a callable object', t => {

      const o = $(0);

      let calls = 0;

      const onChange = {
        call: thiz => {
          calls++;
          t.is ( thiz, onChange );
        }
      };

      $.on ( o, onChange );

      t.is ( calls, 1 );

      $.off ( o, onChange );

      o ( 1 );
      o ( 2 );
      o ( 3 );

      t.is ( calls, 1 );

      $.on ( o, onChange );

      t.is ( calls, 2 );

    });

  });

  describe ( 'on', it => {

    it ( 'can call the registered function when registering', t => {

      const o = $(0);

      $.on ( o, ( value, valuePrev ) => {

        t.is ( value, 0 );
        t.is ( valuePrev, undefined );

      });

    });

    it ( 'can call the registered function when registering, for frozen observables too', t => {

      const o = $.memo ( () => 0 );

      $.on ( o, ( value, valuePrev ) => {

        t.is ( value, 0 );
        t.is ( valuePrev, undefined );

      });

    });

    it ( 'can call the registered function with the current value and, if available, the previous value', t => {

      const o = $(0);

      let calls = 0;

      $.on ( o, ( value, valuePrev ) => {

        t.is ( value, calls ? 1 : 0 );
        t.is ( valuePrev, calls ? 0 : undefined );

        calls += 1;

      });

      t.is ( calls, 1 );

      o ( 1 );

      t.is ( calls, 2 );

    });

    it ( 'can call the registered function before memos', t => {

      const o = $(0);

      let sequence = '';

      $.memo ( () => {

        sequence += 'b';

        o ();

      });

      $.on ( o, () => {

        sequence += 'a';

      });

      t.is ( sequence, 'ba' );

      o ( 1 );

      t.is ( sequence, 'baab' );

      o ( 2 );

      t.is ( sequence, 'baabab' );

    });

    it ( 'can call the registered function before effects', t => {

      const o = $(0);

      let sequence = '';

      $.effect ( () => {

        sequence += 'b';

        o ();

      });

      $.on ( o, () => {

        sequence += 'a';

      });

      t.is ( sequence, 'ba' );

      o ( 1 );

      t.is ( sequence, 'baab' );

      o ( 2 );

      t.is ( sequence, 'baabab' );

    });

    it ( 'can call the registered function before reactions', t => {

      const o = $(0);

      let sequence = '';

      $.reaction ( () => {

        sequence += 'b';

        o ();

      });

      $.on ( o, () => {

        sequence += 'a';

      });

      t.is ( sequence, 'ba' );

      o ( 1 );

      t.is ( sequence, 'baab' );

      o ( 2 );

      t.is ( sequence, 'baabab' );

    });

    it ( 'can call the registered function even if inside a suspended suspense', t => {

      const o = $(0);

      $.suspense ( true, () => {

        $.on ( o, ( value, valuePrev ) => {

          t.is ( value, 0 );
          t.is ( valuePrev, undefined );

        });

      });

    });

    it ( 'can register a function deduplicating registrations', t => {

      const o = $(0);

      let calls = 0;

      const onChange = () => calls++;

      $.on ( o, onChange );

      t.is ( calls, 1 );

      $.on ( o, onChange );
      $.on ( o, onChange );
      $.on ( o, onChange );

      t.is ( calls, 4 );

      o ( 1 );

      t.is ( calls, 5 );

      o ( 1 );
      o ( 1 );
      o ( 1 );

      t.is ( calls, 5 );

    });

    it ( 'returns a disposer function', t => {

      const o = $(0);

      let calls = 0;

      const dispose = $.on ( o, () => {

        calls += 1;

      });

      t.is ( calls, 1 );

      o ( 1 );

      t.is ( calls, 2 );

      dispose ();

      o ( 2 );

      t.is ( calls, 2 );

    });

    it ( 'supports a callable object', t => {

      const o = $(0);

      const on = {
        call: ( thiz, value, valuePrev ) => {
          t.is ( thiz, on );
          t.is ( value, 0 );
          t.is ( valuePrev, undefined );
        }
      };

      $.on ( o, on );

    });

  });

  describe ( 'readonly', it => {

    it ( 'returns the same readonly observable if it gets passed a frozen one', t => {

      const o = $.memo ( () => 123 );
      const ro = $.readonly ( o );

      t.true ( o === ro );

    });

    it ( 'returns the same readonly observable if it gets passed one', t => {

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

      t.true ( ro !== ro2 ); //TODO: Maybe cache read-only Observables and make this ===
      t.true ( ro === rro );

    });

    it ( 'throws when attempting to set', t => {

      const ro = $.readonly ( $() );

      t.throws ( () => ro ( 1 ), { message: 'A readonly Observable can not be updated' } );

    });

  });

  describe ( 'resolve', it => {

    it ( 'properly disposes of inner memos', t => {

      const o = $(2);

      let calls = 0;

      const dispose = $.root ( dispose => {

        const fn = () => {
          $.memo ( () => {
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

    it ( 'properly disposes of inner reactions', t => {

      const o = $(2);

      let calls = 0;

      const dispose = $.root ( dispose => {

        const fn = () => {
          $.reaction ( () => {
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

      t.false ( $.isObservable ( ob.foo ) );
      t.false ( $.isObservable ( oc.foo[0] ) );

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

  describe ( 'reaction', it => {

    it ( 'can not be running multiple times concurrently', t => {

      const o = $(0);

      let executions = 0;

      $.reaction ( () => {

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

        $.reaction ( () => 123 );

      });

    });

    it ( 'cleans up dependencies properly when causing itself to re-execute', t => {

      const a = $(0);
      const b = $(0);

      let calls = 0;

      $.reaction ( () => {

        calls += 1;

        if ( !$.untrack ( a ) ) a ( a () + 1 );

        b ();

      });

      t.is ( calls, 2 );

      a ( 2 );

      t.is ( calls, 2 );

      b ( 1 );

      t.is ( calls, 3 );

    });

    it ( 'cleans up inner reactions', t => {

      const o = $(0);
      const active = $(true);

      let calls = 0;

      $.reaction ( () => {

        if ( !active () ) return;

        $.reaction ( () => {

          calls += 1;

          o ();

        });

      });

      t.is ( calls, 1 );

      active ( false );
      o ( 1 );

      t.is ( calls, 1 );

    });

    it ( 'returns a disposer', t => {

      const a = $(1);
      const b = $(2);
      const c = $();

      const dispose = $.reaction ( () => {
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

      $.reaction ( prev => {

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

      $.reaction ( () => {
        c ( bool () ? a () : b () );
      });

      t.is ( c (), 2 );

      bool ( true );

      t.is ( c (), 1 );

    });

    it ( 'supports manually registering a function to be called when the parent reaction updates', t => {

      const o = $(0);

      let sequence = '';

      $.reaction ( () => {

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

    it ( 'supports manually registering a function to be called when the parent reaction throws', t => {

      const o = $(0);

      let sequence = '';

      $.reaction ( () => {

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

    it ( 'supports automatically registering a function to be called when the parent reaction updates', t => {

      const o = $(0);

      let sequence = '';

      $.reaction ( () => {

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

    it ( 'throws if it receives an async function', t => {

      t.throws ( () => {

        $.reaction ( async () => {} );

      }, { message: 'A computation is forbidden from executing an async function' } );

    });

    it ( 'updates when the dependencies change', t => {

      const a = $(1);
      const b = $(2);
      const c = $();

      $.reaction ( () => {
        c ( a () + b () );
      });

      a ( 3 );
      b ( 7 );

      t.is ( c (), 10 );

    });

    it ( 'updates when the dependencies change inside other reactions', t => {

      const a = $(0);
      const b = $(0);
      let calls = 0;

      $.reaction ( () => {
        calls += 1;
        a ();
      });

      t.is ( calls, 1 );

      $.reaction ( () => {
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

  describe ( 'root', it => {

    it ( 'allows child computations to escape their parents', t => {

      $.root ( () => {

        const outer = $(0);
        const inner = $(0);
        let innerCalls = 0;

        $.memo ( () => {
          outer ();
          $.root ( () => {
            $.memo ( () => {
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
        const b = $.memo ( () => {
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

        $.memo ( () => {
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

        $.memo ( () => {
          calls += 1;
          a ();
          $.memo ( () => {
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
        const b = $.memo ( () => a () );

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

        const b = $.memo ( () => a () );

        a ( 2 );

        const c = $.memo ( () => a () );

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

  describe ( 'selector', it => {

    it ( 'returns an observable', t => {

      const source = $(0);
      const selector = $.selector ( source );
      const selected = selector ( 1 );

      isReadable ( t, selected );

      t.false ( selected () );

      source ( 1 );

      t.true ( selected () );

    });

    it ( 'efficiently tells when the provided item is the selected one', t => {

      const values = [1, 2, 3, 4, 5];
      const selected = $(-1);

      const select = value => selected ( value );
      const selector = $.selector ( selected );

      let sequence = '';

      values.forEach ( value => {

        $.effect ( () => {

          sequence += value;

          if ( !selector ( value )() ) return;

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

    it ( 'survives checking a value inside a discarded root', t => {

      const selected = $(-1);
      const selector = $.selector ( selected );

      let calls = 0;

      $.root ( dispose => {

        selector ( 1 )();

        $.root ( () => {

          selector ( 1 )();

        });

        dispose ();

      });

      $.effect ( () => {

        calls += 1;

        selector ( 1 )();

      });

      t.is ( calls, 1 );

      selected ( 1 );

      t.is ( calls, 2 );

    });

    it ( 'treats 0 and -0 as the same value values', t => {

      const selected = $(0);
      const selector = $.selector ( selected );

      t.true ( selector ( 0 )() );
      t.true ( selector ( -0 )() );

    });

    it ( 'works inside suspense', t => {

      $.suspense ( true, () => {

        const selected = $(-1);

        const selector = $.selector ( selected );

        t.is ( selector ( 1 )(), false );

        selected ( 1 );

        t.is ( selector ( 1 )(), true );

      });

    });

    it ( 'works with stores', t => {

      const store = $.store ({ value: 0 });
      const selector = $.selector ( () => store.value );
      const selected = selector ( 1 );

      isReadable ( t, selected );

      t.false ( selected () );

      store.value = 1;

      t.true ( selected () );

    });

  });

  describe ( 'store', it => {

    describe ( 'mutable', () => {

      it ( 'is both a getter and a setter, for shallow primitive properties', t => {

        const o = $.store ({ value: undefined });

        t.is ( o.value, undefined );

        o.value = 123;

        t.is ( o.value, 123 );

        o.value = 321;

        t.is ( o.value, 321 );

        o.value = undefined;

        t.is ( o.value, undefined );

      });

      it ( 'is both a getter and a setter, for shallow non-primitive properties', t => {

        const obj1 = { foo: 123 };
        const obj2 = [];

        const o = $.store ({ value: obj1 });

        t.deepEqual ( o.value, obj1 );

        o.value = obj2;

        t.deepEqual ( o.value, obj2 );

        o.value = obj1;

        t.deepEqual ( o.value, obj1 );

      });

      it ( 'is both a getter and a setter, for deep primitive properties', t => {

        const o = $.store ({ deep: { value: undefined } });

        t.is ( o.deep.value, undefined );

        o.deep.value = 123;

        t.is ( o.deep.value, 123 );

        o.deep.value = 321;

        t.is ( o.deep.value, 321 );

        o.deep.value = undefined;

        t.is ( o.deep.value, undefined );

      });

      it ( 'is both a getter and a setter, for deep non-primitive properties', t => {

        const obj1 = { foo: 123 };
        const obj2 = [];

        const o = $.store ({ deep: { value: obj1 } });

        t.deepEqual ( o.deep.value, obj1 );

        o.deep.value = obj2;

        t.deepEqual ( o.deep.value, obj2 );

        o.deep.value = obj1;

        t.deepEqual ( o.deep.value, obj1 );

      });

      it ( 'creates a dependency in a memo when getting a shallow property', t => {

        const o = $.store ({ value: 1 });

        let calls = 0;

        $.memo ( () => {
          calls += 1;
          o.value;
        });

        t.is ( calls, 1 );

        o.value = 2;

        t.is ( calls, 2 );

        o.value = 3;

        t.is ( calls, 3 );

      });

      it ( 'creates a dependency in an effect when getting a shallow property', t => {

        const o = $.store ({ value: 1 });

        let calls = 0;

        $.effect ( () => {
          calls += 1;
          o.value;
        });

        t.is ( calls, 1 );

        o.value = 2;

        t.is ( calls, 2 );

        o.value = 3;

        t.is ( calls, 3 );

      });

      it ( 'creates a dependency in a reaction when getting a shallow property', t => {

        const o = $.store ({ value: 1 });

        let calls = 0;

        $.reaction ( () => {
          calls += 1;
          o.value;
        });

        t.is ( calls, 1 );

        o.value = 2;

        t.is ( calls, 2 );

        o.value = 3;

        t.is ( calls, 3 );

      });

      it ( 'creates a dependency in a memo when getting a deep property', t => {

        const o = $.store ({ deep: { value: 1 } });

        let calls = 0;

        $.memo ( () => {
          calls += 1;
          o.deep.value;
        });

        t.is ( calls, 1 );

        o.deep.value = 2;

        t.is ( calls, 2 );

        o.deep.value = 3;

        t.is ( calls, 3 );

      });

      it ( 'creates a dependency in an effect when getting a deep property', t => {

        const o = $.store ({ deep: { value: 1 } });

        let calls = 0;

        $.effect ( () => {
          calls += 1;
          o.deep.value;
        });

        t.is ( calls, 1 );

        o.deep.value = 2;

        t.is ( calls, 2 );

        o.deep.value = 3;

        t.is ( calls, 3 );

      });

      it ( 'creates a dependency in a reaction when getting a deep property', t => {

        const o = $.store ({ deep: { value: 1 } });

        let calls = 0;

        $.reaction ( () => {
          calls += 1;
          o.deep.value;
        });

        t.is ( calls, 1 );

        o.deep.value = 2;

        t.is ( calls, 2 );

        o.deep.value = 3;

        t.is ( calls, 3 );

      });

      it ( 'creates a single dependency in an memo even if getting a shallow property multiple times', t => {

        const o = $.store ({ value: 1 });

        let calls = 0;

        $.memo ( () => {
          calls += 1;
          o.value;
          o.value;
          o.value;
        });

        t.is ( calls, 1 );

        o.value = 2;

        t.is ( calls, 2 );

        o.value = 3;

        t.is ( calls, 3 );

      });

      it ( 'creates a single dependency in an effect even if getting a shallow property multiple times', t => {

        const o = $.store ({ value: 1 });

        let calls = 0;

        $.effect ( () => {
          calls += 1;
          o.value;
          o.value;
          o.value;
        });

        t.is ( calls, 1 );

        o.value = 2;

        t.is ( calls, 2 );

        o.value = 3;

        t.is ( calls, 3 );

      });

      it ( 'creates a single dependency in a reaction even if getting a shallow property multiple times', t => {

        const o = $.store ({ value: 1 });

        let calls = 0;

        $.reaction ( () => {
          calls += 1;
          o.value;
          o.value;
          o.value;
        });

        t.is ( calls, 1 );

        o.value = 2;

        t.is ( calls, 2 );

        o.value = 3;

        t.is ( calls, 3 );

      });

      it ( 'creates a single dependency in a memo even if getting a deep property multiple times', t => {

        const o = $.store ({ deep: { value: 1 } });

        let calls = 0;

        $.memo ( () => {
          calls += 1;
          o.deep.value;
          o.deep.value;
          o.deep.value;
        });

        t.is ( calls, 1 );

        o.deep.value = 2;

        t.is ( calls, 2 );

        o.deep.value = 3;

        t.is ( calls, 3 );

      });

      it ( 'creates a single dependency in an effect even if getting a deep property multiple times', t => {

        const o = $.store ({ deep: { value: 1 } });

        let calls = 0;

        $.effect ( () => {
          calls += 1;
          o.deep.value;
          o.deep.value;
          o.deep.value;
        });

        t.is ( calls, 1 );

        o.deep.value = 2;

        t.is ( calls, 2 );

        o.deep.value = 3;

        t.is ( calls, 3 );

      });

      it ( 'creates a single dependency in a reaction even if getting a deep property multiple times', t => {

        const o = $.store ({ deep: { value: 1 } });

        let calls = 0;

        $.reaction ( () => {
          calls += 1;
          o.deep.value;
          o.deep.value;
          o.deep.value;
        });

        t.is ( calls, 1 );

        o.deep.value = 2;

        t.is ( calls, 2 );

        o.deep.value = 3;

        t.is ( calls, 3 );

      });

      it ( 'does not create a dependency in a memo when creating', t => {

        let o;
        let calls = 0;

        $.memo ( () => {
          calls += 1;
          o = $.store ({ value: 1 });
        });

        t.is ( calls, 1 );

        o.value = 2;

        t.is ( calls, 1 );

      });

      it ( 'does not create a dependency in an effect when creating', t => {

        let o;
        let calls = 0;

        $.effect ( () => {
          calls += 1;
          o = $.store ({ value: 1 });
        });

        t.is ( calls, 1 );

        o.value = 2;

        t.is ( calls, 1 );

      });

      it ( 'does not create a dependency in a reaction when creating', t => {

        let o;
        let calls = 0;

        $.reaction ( () => {
          calls += 1;
          o = $.store ({ value: 1 });
        });

        t.is ( calls, 1 );

        o.value = 2;

        t.is ( calls, 1 );

      });

      it ( 'does not create a dependency in a memo when setting a shallow property', t => {

        let o = $.store ({ value: 0 });
        let calls = 0;

        $.memo ( () => {
          calls += 1;
          o.value = 1;
        });

        t.is ( calls, 1 );

        o.value = 2;

        t.is ( calls, 1 );

      });

      it ( 'does not create a dependency in an effect when setting a shallow property', t => {

        let o = $.store ({ value: 0 });
        let calls = 0;

        $.effect ( () => {
          calls += 1;
          o.value = 1;
        });

        t.is ( calls, 1 );

        o.value = 2;

        t.is ( calls, 1 );

      });

      it ( 'does not create a dependency in a reaction when setting a shallow property', t => {

        let o = $.store ({ value: 0 });
        let calls = 0;

        $.reaction ( () => {
          calls += 1;
          o.value = 1;
        });

        t.is ( calls, 1 );

        o.value = 2;

        t.is ( calls, 1 );

      });

      it ( 'does not create a dependency in a memo when getting a parent property of the one being updated', t => {

        const o = $.store ({ deep: { value: 1 } });

        let calls = 0;

        $.memo ( () => {
          calls += 1;
          o.deep;
        });

        t.is ( calls, 1 );

        o.deep.value = 2;

        t.is ( calls, 1 );

        o.deep.value = 3;

        t.is ( calls, 1 );

      });

      it ( 'does not create a dependency in an effect when getting a parent property of the one being updated', t => {

        const o = $.store ({ deep: { value: 1 } });

        let calls = 0;

        $.effect ( () => {
          calls += 1;
          o.deep;
        });

        t.is ( calls, 1 );

        o.deep.value = 2;

        t.is ( calls, 1 );

        o.deep.value = 3;

        t.is ( calls, 1 );

      });

      it ( 'does not create a dependency in a reaction when getting a parent property of the one being updated', t => {

        const o = $.store ({ deep: { value: 1 } });

        let calls = 0;

        $.reaction ( () => {
          calls += 1;
          o.deep;
        });

        t.is ( calls, 1 );

        o.deep.value = 2;

        t.is ( calls, 1 );

        o.deep.value = 3;

        t.is ( calls, 1 );

      });

      it ( 'does create a dependency (on the parent) in a memo when setting a deep property', t => { //FIXME: This can't quite be fixed, it's a quirk of how mutable stores work

        const o = $.store ({ deep: { value: 1 } });

        let calls = 0;

        $.memo ( () => {
          calls += 1;
          o.deep.value = 2;
        });

        t.is ( calls, 1 );

        o.deep.value = 3;

        t.is ( calls, 1 );

        o.deep = {};

        t.is ( calls, 2 );

      });

      it ( 'does create a dependency (on the parent) in an effect when setting a deep property', t => { //FIXME: This can't quite be fixed, it's a quirk of how mutable stores work

        const o = $.store ({ deep: { value: 1 } });

        let calls = 0;

        $.effect ( () => {
          calls += 1;
          o.deep.value = 2;
        });

        t.is ( calls, 1 );

        o.deep.value = 3;

        t.is ( calls, 1 );

        o.deep = {};

        t.is ( calls, 2 );

      });

      it ( 'does create a dependency (on the parent) in a reaction when setting a deep property', t => { //FIXME: This can't quite be fixed, it's a quirk of how mutable stores work

        const o = $.store ({ deep: { value: 1 } });

        let calls = 0;

        $.reaction ( () => {
          calls += 1;
          o.deep.value = 2;
        });

        t.is ( calls, 1 );

        o.deep.value = 3;

        t.is ( calls, 1 );

        o.deep = {};

        t.is ( calls, 2 );

      });

      it ( 'returns primitive values as is', t => {

        const o = $.store ( 123 );

        t.is ( o, 123 );

      });

      it ( 'returns unproxiable non-primitive values as is', t => {

        const date = new Date ();
        const o = $.store ( date );

        t.is ( o, date );
        t.false ( $.isStore ( o ) );

      });

      it ( 'returns unproxied "__proto__", "prototype" and "constructor" properties', t => {

        const a = {};
        const b = {};
        const c = {};
        const sa = $.store ({ prototype: a });
        const sb = $.store ({ '__proto__': b });
        const sc = $.store ({ constructr: c });

        t.false ( $.isStore ( sa.__proto__ ) );
        t.false ( $.isStore ( sb.prototype ) );
        t.false ( $.isStore ( sc.constructor ) );

      });

      it ( 'returns unproxied "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toSource", "toString", "valueOf", properties', t => {

        const o = $.store ( {} );

        let calls = 0;

        $.effect ( () => {
          calls += 1;
          o.hasOwnProperty;
          o.isPrototypeOf;
          o.propertyIsEnumerable;
          o.toLocaleString;
          o.toSource;
          o.toString;
          o.valueOf;
        });

        t.is ( calls, 1 );

        o.hasOwnProperty = 1;
        o.isPrototypeOf = 1;
        o.propertyIsEnumerable = 1;
        o.toLocaleString = 1;
        o.toSource = 1;
        o.toString = 1;
        o.valueOf = 1;

        t.is ( calls, 1 );

      });

      it ( 'returns the value being set', t => {

        const o = $.store ({ value: undefined });

        t.is ( o.value = 123, 123 );

      });

      it ( 'supports setting functions as is', t => {

        const fn = () => {};
        const o = $.store ({ value: () => {} });

        o.value = fn;

        t.is ( o.value, fn );

      });

      it ( 'supports wrapping a plain object', t => {

        const o = $.store ( {} );

        t.true ( $.isStore ( o ) );

      });

      it ( 'supports wrapping a deep array inside a plain object', t => {

        const o = $.store ( { value: [] } );

        t.true ( $.isStore ( o.value ) );

      });

      it ( 'supports wrapping a deep plain object inside a plain object', t => {

        const o = $.store ( { value: {} } );

        t.true ( $.isStore ( o.value ) );

      });

      it ( 'supports wrapping an array', t => {

        const o = $.store ( [] );

        t.true ( $.isStore ( o ) );

      });

      it ( 'supports wrapping a deep array inside an array', t => {

        const o = $.store ( [[]] );

        t.true ( $.isStore ( o[0] ) );

      });

      it ( 'supports wrapping a deep plain object inside an array', t => {

        const o = $.store ( [{}] );

        t.true ( $.isStore ( o[0] ) );

      });

      it ( 'supports reacting to deleting a shallow property', t => {

        const o = $.store ( { value: 123 } );

        let calls = 0;

        $.effect ( () => {
          calls += 1;
          o.value;
        });

        t.is ( calls, 1 );

        delete o.value;

        t.is ( calls, 2 );

      });

      it ( 'supports not reacting when deleting a shallow property that was undefined', t => {

        const o = $.store ( { value: undefined } );

        let calls = 0;

        $.effect ( () => {
          calls += 1;
          o.value;
        });

        t.is ( calls, 1 );

        delete o.value;

        t.is ( calls, 1 );

      });

      it ( 'supports reacting to deleting a deep property', t => {

        const o = $.store ( { deep: { value: 123 } } );

        let calls = 0;

        $.effect ( () => {
          calls += 1;
          o.deep.value;
        });

        t.is ( calls, 1 );

        delete o.deep.value;

        t.is ( calls, 2 );

      });

      it ( 'supports not reacting when deleting a deep property that was undefined', t => {

        const o = $.store ( { deep: { value: undefined } } );

        let calls = 0;

        $.effect ( () => {
          calls += 1;
          o.deep.value;
        });

        t.is ( calls, 1 );

        delete o.deep.value;

        t.is ( calls, 1 );

      });

      it ( 'supports reacting to own keys', t => {

        const o = $.store ( { foo: 1, bar: 2, baz: 3 } );

        let calls = 0;

        $.effect ( () => {
          calls += 1;
          Object.keys ( o );
        });

        t.is ( calls, 1 );

        o.qux = 4;

        t.is ( calls, 2 );

        o.foo = 2;
        o.bar = 3;
        o.baz = 4;
        o.qux = 5;

        t.is ( calls, 2 );

        delete o.foo;

        t.is ( calls, 3 );

      });

      it ( 'supports unwrapping a plain object', t => {

        const wrapped = $.store ( { value: [] } );

        t.true ( $.isStore ( wrapped ) );
        t.true ( $.isStore ( wrapped.value ) );

        const unwrapped = $.store ( wrapped, { unwrap: true } );

        t.false ( $.isStore ( unwrapped ) );
        t.false ( $.isStore ( unwrapped.value ) );

      });

      it ( 'supports unwrapping an array', t => {

        const wrapped = $.store ( [{}] );

        t.true ( $.isStore ( wrapped ) );
        t.true ( $.isStore ( wrapped[0] ) );

        const unwrapped = $.store ( wrapped, { unwrap: true } );

        t.false ( $.isStore ( unwrapped ) );
        t.false ( $.isStore ( unwrapped[0] ) );

      });

      it ( 'supports reacting to properties read by a getter', t => {

        const o = $.store ( { foo: 1, bar: 2, get fn () { return this.foo + this.bar; } } );

        let calls = 0;

        $.effect ( () => {
          calls += 1;
          o.fn;
        });

        t.is ( calls, 1 );

        o.foo = 10;

        t.is ( calls, 2 );
        t.is ( o.fn, 12 );

        o.bar = 20;

        t.is ( calls, 3 );
        t.is ( o.fn, 30 );

      });

      it ( 'supports reacting to properties read by a regular function', t => {

        const o = $.store ( { foo: 1, bar: 2, fn () { return this.foo + this.bar; } } );

        let calls = 0;

        $.effect ( () => {
          calls += 1;
          o.fn ();
        });

        t.is ( calls, 1 );

        o.foo = 10;

        t.is ( calls, 2 );
        t.is ( o.fn (), 12 );

        o.bar = 20;

        t.is ( calls, 3 );
        t.is ( o.fn (), 30 );

      });

      it ( 'supports reacting to properties read by a regular function, called via the call method', t => {

        const o = $.store ( { foo: 1, bar: 2, fn () { return this.foo + this.bar; } } );

        let calls = 0;

        $.effect ( () => {
          calls += 1;
          o.fn.call ( o );
        });

        t.is ( calls, 1 );

        o.foo = 10;

        t.is ( calls, 2 );
        t.is ( o.fn.call ( o ), 12 );

        o.bar = 20;

        t.is ( calls, 3 );
        t.is ( o.fn.call ( o ), 30 );

      });

      it ( 'supports reacting to properties read by a regular function, called via the apply method', t => {

        const o = $.store ( { foo: 1, bar: 2, fn () { return this.foo + this.bar; } } );

        let calls = 0;

        $.effect ( () => {
          calls += 1;
          o.fn.apply ( o );
        });

        t.is ( calls, 1 );

        o.foo = 10;

        t.is ( calls, 2 );
        t.is ( o.fn.apply ( o ), 12 );

        o.bar = 20;

        t.is ( calls, 3 );
        t.is ( o.fn.apply ( o ), 30 );

      });

      it ( 'supports batching manually', t => {

        const o = $.store ( { foo: 1, bar: 2 } );

        let calls = 0;

        $.effect ( () => {
          calls += 1;
          o.foo;
          o.bar;
        });

        t.is ( calls, 1 );

        $.batch ( () => {

          o.foo = 10;
          o.bar = 20;

          t.is ( calls, 1 );
          t.is ( o.foo, 10 );
          t.is ( o.bar, 20 );

        });

        t.is ( calls, 2 );
        t.is ( o.foo, 10 );
        t.is ( o.bar, 20 );

      });

      it ( 'supports batching setters automatically', t => {

        const o = $.store ( { foo: 1, bar: 2, set fn ( increment ) { this.foo += increment; this.bar += increment; } } );

        let calls = 0;

        $.effect ( () => {
          calls += 1;
          o.foo;
          o.bar;
        });

        t.is ( calls, 1 );

        o.fn = 1;

        t.is ( calls, 2 );
        t.is ( o.foo, 2 );
        t.is ( o.bar, 3 );

      });

      it ( 'supports batching deletations automatically', t => {

        const o = $.store ( { foo: 1, bar: 2 } );

        let calls = 0;

        $.effect ( () => {
          calls += 1;
          o.foo;
          if ( 'foo' in o ) {}
          Object.keys ( o );
        });

        t.is ( calls, 1 );

        delete o.foo;

        t.is ( calls, 2 );

      });

      it ( 'supports batching additions automatically', t => {

        const o = $.store ( { bar: 2 } );

        let calls = 0;

        $.effect ( () => {
          calls += 1;
          o.foo;
          if ( 'foo' in o ) {}
          Object.keys ( o );
        });

        t.is ( calls, 1 );

        o.foo = 1;

        t.is ( calls, 2 );

      });

      it ( 'supports reacting to changes in deep arrays', t => {

        const o = $.store ( { value: [1, 2] } );

        let calls = 0;

        $.effect ( () => {
          calls += 1;
          o.value.length;
        });

        t.is ( calls, 1 );

        o.value.pop ();

        t.is ( calls, 2 );

        o.value.pop ();

        t.is ( calls, 3 );

        o.value.push ( 1 );

        t.is ( calls, 4 );

      });

      it ( 'supports reacting to changes in top-level arrays', t => {

        const o = $.store ( [1, 2] );

        let calls = 0;

        $.effect ( () => {
          calls += 1;
          o.length;
        });

        t.is ( calls, 1 );

        o.pop ();

        t.is ( calls, 2 );

        o.pop ();

        t.is ( calls, 3 );

        o.push ( 1 );

        t.is ( calls, 4 );

      });

      it ( 'supports reacting to changes at a specific index in deep arrays', t => {

        const o = $.store ( { value: [1, 2] } );

        let calls = 0;

        $.effect ( () => {
          calls += 1;
          o.value[0];
        });

        t.is ( calls, 1 );

        o.value.pop ();

        t.is ( calls, 1 );

        o.value.push ( 10 );

        t.is ( calls, 1 );

        o.value[0] = 123;

        t.is ( calls, 2 );

        o.value.unshift ( 1 );

        t.is ( calls, 3 );

        o.value.unshift ( 1 );

        t.is ( calls, 3 );

        o.value.unshift ( 2 );

        t.is ( calls, 4 );

      });

      it ( 'supports reacting to changes at a specific index in top-level arrays', t => {

        const o = $.store ( [1, 2] );

        let calls = 0;

        $.effect ( () => {
          calls += 1;
          o[0];
        });

        t.is ( calls, 1 );

        o.pop ();

        t.is ( calls, 1 );

        o.push ( 10 );

        t.is ( calls, 1 );

        o[0] = 123;

        t.is ( calls, 2 );

        o.unshift ( 1 );

        t.is ( calls, 3 );

        o.unshift ( 1 );

        t.is ( calls, 3 );

        o.unshift ( 2 );

        t.is ( calls, 4 );

      });

      it ( 'supports batching array methods automatically', t => {

        const o = $.store ( { value: [1, 2, 3] } );

        let calls = 0;

        $.effect ( () => {
          calls += 1;
          o.value.forEach ( () => {} );
        });

        t.is ( calls, 1 );

        o.value.forEach ( ( value, index ) => {
          o.value[index] = value * 2;
        });

        t.is ( calls, 2 );

      });

      it ( 'supports reacting to property checks, deleting', t => {

        const o = $.store ( { value: undefined } );

        let calls = 0;

        $.effect ( () => {
          calls += 1;
          if ( 'value' in o ) {}
        });

        t.is ( calls, 1 );

        delete o.value;

        t.is ( calls, 2 );

        delete o.value;

        t.is ( calls, 2 );

      });

      it ( 'supports reacting to property checks, adding', t => {

        const o = $.store ( {} );

        let calls = 0;

        $.effect ( () => {
          calls += 1;
          if ( 'value' in o ) {}
        });

        t.is ( calls, 1 );

        o.value = undefined;

        t.is ( calls, 2 );

        o.value = undefined;

        t.is ( calls, 2 );

      });

      it ( 'supports wrapping, unwrapping, and re-wrapping without losing reactivity', t => {

        const o = $.store ( { foo: 1 } );

        let calls = 0;

        $.effect ( () => {
          calls += 1;
          o.foo;
        });

        t.is ( calls, 1 );

        const rewrapped = $.store ( $.store ( o, { unwrap: true } ) );

        rewrapped.foo = 10;

        t.is ( calls, 2 );
        t.is ( o.foo, 10 );
        t.is ( rewrapped.foo, 10 );

      });

      it ( 'survives reading a value inside a discarded root', t => {

        const o = $.store ({ value: 123 });

        let calls = 0;

        $.root ( dispose => {

          o.value;

          $.root ( () => {

            o.value;

          });

          dispose ();

        });

        $.effect ( () => {

          calls += 1;

          o.value;

        });

        t.is ( calls, 1 );

        o.value = 321;

        t.is ( calls, 2 );

      });

      it ( 'supports reacting to changes of keys caused by Object.defineProperty, adding enumerable property', t => {

        const o = $.store ( {} );

        let calls = 0;

        $.effect ( () => {
          calls += 1;
          Object.keys ( o );
        });

        t.is ( calls, 1 );
        t.is ( o.value, undefined );

        Object.defineProperty ( o, 'value', {
          enumerable: true,
          value: 123
        });

        t.is ( calls, 2 );
        t.is ( o.value, 123 );

      });

      it ( 'supports reacting to changes of keys caused by Object.defineProperty, deleting enumerable property', t => {

        const o = $.store ( { value: 1 } );

        let calls = 0;

        $.effect ( () => {
          calls += 1;
          Object.keys ( o );
        });

        t.is ( calls, 1 );
        t.is ( o.value, 1 );

        Object.defineProperty ( o, 'value', {
          enumerable: false,
          value: 123
        });

        t.is ( calls, 2 );
        t.is ( o.value, 123 );

      });

      it ( 'supports not reacting to changes of keys caused by Object.defineProperty, overriding enumerable property', t => {

        const o = $.store ( { value: 1 } );

        let calls = 0;

        $.effect ( () => {
          calls += 1;
          Object.keys ( o );
        });

        t.is ( calls, 1 );
        t.is ( o.value, 1 );

        Object.defineProperty ( o, 'value', {
          enumerable: true,
          value: 123
        });

        t.is ( calls, 1 );
        t.is ( o.value, 123 );

      });

      it ( 'supports not reacting to changes of keys caused by Object.defineProperty, adding non-enumerable property', t => {

        const o = $.store ( {} );

        let calls = 0;

        $.effect ( () => {
          calls += 1;
          Object.keys ( o );
        });

        t.is ( calls, 1 );
        t.is ( o.value, undefined );

        Object.defineProperty ( o, 'value', {
          enumerable: false,
          value: 123
        });

        t.is ( calls, 1 );
        t.is ( o.value, 123 );

      });

      it ( 'supports reacting to changes of in caused by Object.defineProperty, adding enumerable property', t => {

        const o = $.store ( {} );

        let calls = 0;

        $.effect ( () => {
          calls += 1;
          if ( 'value' in o ) {}
        });

        t.is ( calls, 1 );
        t.is ( o.value, undefined );

        Object.defineProperty ( o, 'value', {
          enumerable: true,
          value: 123
        });

        t.is ( calls, 2 );
        t.is ( o.value, 123 );

      });

      it ( 'supports reacting to changes of in caused by Object.defineProperty, deleting enumerable property',t => {

        const o = $.store ( { value: 1 } );

        let calls = 0;

        $.effect ( () => {
          calls += 1;
          if ( 'value' in o ) {}
        });

        t.is ( calls, 1 );
        t.is ( o.value, 1 );

        Object.defineProperty ( o, 'value', {
          enumerable: false,
          value: 123
        });

        t.is ( calls, 2 );
        t.is ( o.value, 123 );

      });

      it ( 'supports not reacting to changes of in caused by Object.defineProperty, overriding enumerable property', t => {

        const o = $.store ( { value: 1 } );

        let calls = 0;

        $.effect ( () => {
          calls += 1;
          if ( 'value' in o ) {}
        });

        t.is ( calls, 1 );
        t.is ( o.value, 1 );

        Object.defineProperty ( o, 'value', {
          enumerable: true,
          value: 123
        });

        t.is ( calls, 1 );
        t.is ( o.value, 123 );

      });

      it ( 'supports not reacting to changes of in caused by Object.defineProperty, adding non-enumerable property', t => {

        const o = $.store ( {} );

        let calls = 0;

        $.effect ( () => {
          calls += 1;
          if ( 'value' in o ) {}
        });

        t.is ( calls, 1 );
        t.is ( o.value, undefined );

        Object.defineProperty ( o, 'value', {
          enumerable: false,
          value: 123
        });

        t.is ( calls, 1 );
        t.is ( o.value, 123 );

      });

      it ( 'supports reacting to changes in getters caused by Object.defineProperty, addition', t => {

        const o = $.store ( { foo: 1, bar: 2 } );

        let calls = 0;
        let args = [];

        $.effect ( () => {
          calls += 1;
          args.push ( o.fn );
        });

        t.is ( calls, 1 );
        t.deepEqual ( args, [undefined] );

        Object.defineProperty ( o, 'fn', {
            get: function () {
              return this.foo + this.bar;
            }
          }
        );

        t.is ( calls, 2 );
        t.deepEqual ( args, [undefined, 3] );

      });

      it ( 'supports reacting to changes in getters caused by Object.defineProperty, override with value', t => {

        const o = $.store ( { foo: 1, bar: 2, get fn () { return this.foo + this.bar; } } );

        let calls = 0;
        let args = [];

        $.effect ( () => {
          calls += 1;
          args.push ( o.fn );
        });

        t.is ( calls, 1 );
        t.deepEqual ( args, [3] );

        Object.defineProperty ( o, 'fn', {
            value: 123
          }
        );

        t.is ( calls, 2 );
        t.deepEqual ( args, [3, 123] );

      });

      it ( 'supports reacting to changes in getters caused by Object.defineProperty, override with new getter', t => {

        const o = $.store ( { foo: 1, bar: 2, get fn () { return this.foo + this.bar; } } );

        let calls = 0;
        let args = [];

        $.effect ( () => {
          calls += 1;
          args.push ( o.fn );
        });

        t.is ( calls, 1 );
        t.deepEqual ( args, [3] );

        Object.defineProperty ( o, 'fn', {
            get: function () {
              return ( this.foo + this.bar ) * 10;
            }
          }
        );

        t.is ( calls, 2 );
        t.deepEqual ( args, [3, 30] );

      });

      it ( 'supports not reacting to changes in getters caused by Object.defineProperty, override with same getter', t => {

        const o = $.store ( { foo: 1, bar: 2, get fn () { return this.foo + this.bar; } } );

        let calls = 0;
        let args = [];

        $.effect ( () => {
          calls += 1;
          args.push ( o.fn );
        });

        t.is ( calls, 1 );
        t.deepEqual ( args, [3] );

        Object.defineProperty ( o, 'fn', {
            get: Object.getOwnPropertyDescriptor ( o, 'fn' ).get
          }
        );

        t.is ( calls, 1 );
        t.deepEqual ( args, [3] );

      });

      it ( 'supports reacting to changes in setters caused by Object.defineProperty, addition', t => {

        const o = $.store ( { foo: 1, bar: 2 } );

        let calls = 0;

        $.effect ( () => {
          calls += 1;
          o.fn = 3;
          o.fn;
        });

        t.is ( calls, 1 );
        t.is ( o.fn, 3 );
        t.is ( o._fn, undefined );

        Object.defineProperty ( o, 'fn', {
            set: function ( value ) {
              return this._fn = value * 10;
            }
          }
        );

        t.is ( calls, 2 );
        t.is ( o.fn, undefined );
        t.is ( o._fn, 30 );

      });

      it.skip ( 'supports reacting to changes in setters caused by Object.defineProperty, override with new setter', t => {

        const o = $.store ( { foo: 1, bar: 2, set fn ( value ) { this._fn = value; } } );

        let calls = 0;

        $.effect ( () => {
          calls += 1;
          o.fn = 3;
          o.fn;
        });

        t.is ( calls, 1 );
        t.is ( o._fn, 3 );

        Object.defineProperty ( o, 'fn', {
            set: function ( value ) {
              return this._fn = value * 10;
            }
          }
        );

        t.is ( calls, 2 );
        t.is ( o._fn, 30 );

      });

      it.skip ( 'supports not reacting to changes in setters caused by Object.defineProperty, override with same setter', t => {

        const o = $.store ( { foo: 1, bar: 2, set fn ( value ) { this._fn = value; } } );

        let calls = 0;

        $.effect ( () => {
          calls += 1;
          o.fn = 3;
          o.fn;
        });

        t.is ( calls, 1 );
        t.is ( o._fn, 3 );

        Object.defineProperty ( o, 'fn', {
            set: Object.getOwnPropertyDescriptor ( o, 'fn' ).set
          }
        );

        t.is ( calls, 1 );
        t.is ( o._fn, 3 );

      });

      it ( 'supports reacting to changes of value caused by Object.defineProperty', t => {

        const o = $.store ( { value: 1 } );

        let calls = 0;
        let args = [];

        $.effect ( () => {
          calls += 1;
          args.push ( o.value );
        });

        t.is ( calls, 1 );
        t.deepEqual ( args, [1] );

        Object.defineProperty ( o, 'value', {
            value: 123
          }
        );

        t.is ( calls, 2 );
        t.deepEqual ( args, [1, 123] );

      });

      it ( 'supports not reacting to changes of value caused by Object.defineProperty', t => {

        const o = $.store ( { value: 123 } );

        let calls = 0;
        let args = [];

        $.effect ( () => {
          calls += 1;
          args.push ( o.value );
        });

        t.is ( calls, 1 );
        t.deepEqual ( args, [123] );

        Object.defineProperty ( o, 'value', {
            value: 123
          }
        );

        t.is ( calls, 1 );
        t.deepEqual ( args, [123] );

      });

      it ( 'treats number and string properties the same way', t => {

        const o = $.store ([ 0 ]);

        let callsNumber = 0;
        let callsString = 0;

        $.effect ( () => {
          callsNumber += 1;
          o[0];
        });

        $.effect ( () => {
          callsString += 1;
          o['0'];
        });

        t.is ( callsNumber, 1 );
        t.is ( callsString, 1 );

        o[0] = 1;

        t.is ( callsNumber, 2 );
        t.is ( callsString, 2 );

        o['0'] = 2;

        t.is ( callsNumber, 3 );
        t.is ( callsString, 3 );

      });

    });

  });

  describe ( 'suspense', it => {

    it ( 'can accept a primitive falsy condition', t => {

      const o = $(0);
      const suspended = 0;

      let calls = 0;

      $.suspense ( suspended, () => {

        $.effect ( () => {

          calls += 1;

          o ();

        });

      });

      t.is ( calls, 1 );

      o ( 1 );

      t.is ( calls, 2 );

    });

    it ( 'can accept a primitive truthy condition', t => {

      const o = $(0);
      const suspended = 1;

      let calls = 0;

      $.suspense ( suspended, () => {

        $.effect ( () => {

          calls += 1;

          o ();

        });

      });

      t.is ( calls, 0 );

      o ( 1 );

      t.is ( calls, 0 );

    });

    it ( 'can accept a function condition', t => {

      const o = $(0);
      const suspended = $(true);
      const condition = () => !suspended ();

      let calls = 0;

      $.suspense ( condition, () => {

        $.effect ( () => {

          calls += 1;

          o ();

        });

      });

      t.is ( calls, 1 );

      suspended ( false );

      o ( 1 );

      t.is ( calls, 1 );

    });

    it ( 'can suspend and unsuspend again when the condition changes', t => {

      const o = $(0);
      const suspended = $(false);

      let calls = 0;

      $.suspense ( suspended, () => {

        $.effect ( () => {

          calls += 1;

          o ();

        });

      });

      t.is ( calls, 1 );

      suspended ( true );
      suspended ( true );

      o ( 1 );

      t.is ( calls, 1 );

      suspended ( false );
      suspended ( false );

      t.is ( calls, 2 );

      suspended ( 1 );
      suspended ( 1 );

      o ( 2 );

      t.is ( calls, 2 );

      suspended ( 0 );
      suspended ( 0 );

      t.is ( calls, 3 );

    });

    it ( 'can suspend and unsuspend the execution of a an effect', t => {

      const o = $(0);
      const suspended = $(false);

      let calls = 0;

      $.suspense ( suspended, () => {

        $.effect ( () => {

          calls += 1;

          o ();

        });

      });

      t.is ( calls, 1 );

      suspended ( true );

      o ( 1 );

      t.is ( calls, 1 );

      suspended ( false );

      t.is ( calls, 2 );

    });

    it ( 'can suspend and unsuspend the execution of an effect created in an effect', t => {

      const o = $(0);
      const suspended = $(false);

      let sequence = '';

      $.suspense ( suspended, () => {

        $.effect ( () => {

          sequence += 'a';

          $.effect ( () => {

            sequence += 'b';

            o ();

          });

        });

      });

      t.is ( sequence, 'ab' );

      suspended ( true );

      o ( 1 );

      t.is ( sequence, 'ab' );

      suspended ( false );

      t.is ( sequence, 'abb' );

    });

    it ( 'can suspend and unsuspend the execution of an effect created in a memo', t => {

      const o = $(0);
      const suspended = $(false);

      let sequence = '';

      $.suspense ( suspended, () => {

        $.memo ( () => {

          sequence += 'a';

          $.effect ( () => {

            sequence += 'b';

            o ();

          });

        });

      });

      t.is ( sequence, 'ab' );

      suspended ( true );

      o ( 1 );

      t.is ( sequence, 'ab' );

      suspended ( false );

      t.is ( sequence, 'abb' );

    });

    it ( 'can suspend and unsuspend the execution of an effect created in a root', t => {

      const o = $(0);
      const suspended = $(false);

      let sequence = '';

      $.suspense ( suspended, () => {

        $.root ( () => {

          sequence += 'a';

          $.effect ( () => {

            sequence += 'b';

            o ();

          });

        });

      });

      t.is ( sequence, 'ab' );

      suspended ( true );

      o ( 1 );

      t.is ( sequence, 'ab' );

      suspended ( false );

      t.is ( sequence, 'abb' );

    });

    it ( 'can suspend and unsuspend the execution of an effect created in a for', t => {

      const o = $(0);
      const suspended = $(false);
      const array = [1, 2, 3];

      let calls = 0;

      $.suspense ( suspended, () => {
        $.for ( array, () => {
          $.effect ( () => {
            calls += 1;
            o ();
          });
        });
      });

      t.is ( calls, 3 );

      suspended ( true );

      o ( 1 );

      t.is ( calls, 3 );

      suspended ( false );

      t.is ( calls, 6 );

    });

    it ( 'can suspend and unsuspend the execution of an effect created in a forIndex', t => {

      const o = $(0);
      const suspended = $(false);
      const array = [1, 2, 3];

      let calls = 0;

      $.suspense ( suspended, () => {
        $.forIndex ( array, () => {
          $.effect ( () => {
            calls += 1;
            o ();
          });
        });
      });

      t.is ( calls, 3 );

      suspended ( true );

      o ( 1 );

      t.is ( calls, 3 );

      suspended ( false );

      t.is ( calls, 6 );

    });

    it ( 'can suspend and unsuspend the execution of an effect created in a suspense', t => {

      const o = $(0);
      const suspended = $(false);

      let sequence = '';

      $.suspense ( suspended, () => {

        $.suspense ( false, () => {

          sequence += 'a';

          $.effect ( () => {

            sequence += 'b';

            o ();

          });

        });

      });

      t.is ( sequence, 'ab' );

      suspended ( true );

      o ( 1 );

      t.is ( sequence, 'ab' );

      suspended ( false );

      t.is ( sequence, 'abb' );

    });

    it ( 'can unsuspend only when all parents are unsuspended too', t => {

      const o = $(0);
      const a = $(true);
      const b = $(true);
      const c = $(true);

      let sequence = '';

      $.suspense ( a, () => {

        $.effect ( () => {

          sequence += 'a';

          o ();

        });

        $.suspense ( b, () => {

          $.effect ( () => {

            sequence += 'b';

            o ();

          });

          $.suspense ( c, () => {

            $.effect ( () => {

              sequence += 'c';

              o ();

            });

          });

        });

      });

      t.is ( sequence, '' );

      c ( false );

      t.is ( sequence, '' );

      b ( false );

      t.is ( sequence, '' );

      a ( false );

      t.is ( sequence, 'abc' );

    });

    it ( 'can suspend a lazily-crated effect', t => {

      const o = $(0);
      const lazy = $(false);
      const suspended = $(true);

      let calls = 0;

      $.suspense ( suspended, () => {

        $.memo ( () => {

          if ( !lazy () ) return;

          $.effect ( () => {

            calls += 1;

            o ();

          });

        });

      });

      t.is ( calls, 0 );

      lazy ( true );

      t.is ( calls, 0 );

      suspended ( false );

      t.is ( calls, 1 );

    });

    it ( 'can suspend a lazily-crated suspense', t => {

      const o = $(0);
      const lazy = $(false);
      const suspended = $(true);

      let calls = 0;

      $.suspense ( suspended, () => {

        $.memo ( () => {

          if ( !lazy () ) return;

          $.suspense ( false, () => {

            $.effect ( () => {

              calls += 1;

              o ();

            });

          });

        });

      });

      t.is ( calls, 0 );

      lazy ( true );

      t.is ( calls, 0 );

      suspended ( false );

      t.is ( calls, 1 );

    });

    it ( 'can not suspend a memo', t => {

      const o = $(0);
      const suspended = $(false);

      let calls = 0;

      $.suspense ( suspended, () => {

        $.memo ( () => {

          calls += 1;

          o ();

        });

      });

      t.is ( calls, 1 );

      suspended ( true );

      o ( 1 );

      t.is ( calls, 2 );

      suspended ( false );

      t.is ( calls, 2 );

    });

    it ( 'can not suspend a reaction', t => {

      const o = $(0);
      const suspended = $(false);

      let calls = 0;

      $.suspense ( suspended, () => {

        $.reaction ( () => {

          calls += 1;

          o ();

        });

      });

      t.is ( calls, 1 );

      suspended ( true );

      o ( 1 );

      t.is ( calls, 2 );

      suspended ( false );

      t.is ( calls, 2 );

    });

    it ( 'returns whatever the function returns', t => {

      const result = $.suspense ( false, () => {

        return 123;

      });

      t.is ( result, 123 );

    });

    it ( 'starts unsuspended with no parent and a false condition', t => {

      const o = $(0);
      const suspended = $(false);

      let calls = 0;

      $.suspense ( suspended, () => {

        $.effect ( () => {

          calls += 1;

          o ();

        });

      });

      t.is ( calls, 1 );

      suspended ( true );

      o ( 1 );

      t.is ( calls, 1 );

      suspended ( false );

      t.is ( calls, 2 );

    });

    it ( 'starts unsuspended with an unsuspended parent and a false condition', t => {

      const o = $(0);
      const suspended = $(false);

      let calls = 0;

      $.suspense ( false, () => {

        $.suspense ( suspended, () => {

          $.effect ( () => {

            calls += 1;

            o ();

          });

        });

      });

      t.is ( calls, 1 );

      suspended ( true );

      o ( 1 );

      t.is ( calls, 1 );

      suspended ( false );

      t.is ( calls, 2 );

    });

    it ( 'starts suspended with a suspended parent and a false condition', t => {

      const o = $(0);
      const suspended = $(true);

      let calls = 0;

      $.suspense ( suspended, () => {

        $.suspense ( false, () => {

          $.effect ( () => {

            calls += 1;

            o ();

          });

        });

      });

      t.is ( calls, 0 );

      suspended ( false );

      t.is ( calls, 1 );

      o ( 1 );

      t.is ( calls, 2 );

    });

    it ( 'starts suspended with an unuspended parent and a true condition', t => {

      const o = $(0);
      const suspended = $(false);

      let calls = 0;

      $.suspense ( suspended, () => {

        $.suspense ( true, () => {

          $.effect ( () => {

            calls += 1;

            o ();

          });

        });

      });

      t.is ( calls, 0 );

      suspended ( false );

      t.is ( calls, 0 );

    });

    it ( 'starts suspended with a suspended parent and a true condition', t => {

      const o = $(0);
      const suspended = $(true);

      let calls = 0;

      $.suspense ( suspended, () => {

        $.suspense ( true, () => {

          $.effect ( () => {

            calls += 1;

            o ();

          });

        });

      });

      t.is ( calls, 0 );

      suspended ( false );

      t.is ( calls, 0 );

    });

    it ( 'supports cleaning up suspended, but executed, effects', t => {

      const suspended = $(false);

      let calls = 0;

      $.root ( dispose => {

        $.suspense ( suspended, () => {

          $.effect ( () => {

            $.cleanup ( () => {

              calls += 1;

            });

          });

        });

        suspended ( true );

        t.is ( calls, 0 );

        dispose ();

        t.is ( calls, 1 );

      });

    });

    it ( 'supports not cleaning suspended, and never executed, effects', t => {

      const suspended = $(true);

      let calls = 0;

      $.root ( dispose => {

        $.suspense ( suspended, () => {

          $.effect ( () => {

            $.cleanup ( () => {

              calls += 1;

            });

          });

        });

        dispose ();

        t.is ( calls, 0 );

      });

    });

    it ( 'supports unsuspending with a disposed always-suspended effect without causing the effect to be executed', t => {

      const suspended = $(true);

      let calls = 0;

      $.suspense ( suspended, () => {

        $.root ( dispose => {

          $.effect ( () => {

            calls += 1;

          });

          dispose ();

          suspended ( false );

          t.is ( calls, 0 );

        });

      });

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

    it ( 'resolves the fallback value before returning it', t => {

      const result = $.switch ( 2, [[1, '1']], () => () => 'fallback' );

      isReadable ( t, result );
      isReadable ( t, result () );
      isReadable ( t, result ()() );

      t.is ( result ()()(), 'fallback' );

    });

    it ( 'returns a memo to matching case or the default case with a functional condition', t => {

      const o = $(1);

      const result = $.switch ( o, [[1, '1'], [2, '2'], [1, '1.1'], ['default']] );

      t.is ( result (), '1' );

      o ( 2 );

      t.is ( result (), '2' );

      o ( 3 );

      t.is ( result (), 'default' );

    });

    it ( 'returns a memo to the value of the default case if no case before it matches', t => {

      const result = $.switch ( 2, [[1, '1'], ['default'], [2, '2'] [1, '1.1']] );

      t.is ( result (), 'default' );

    });

    it ( 'returns a memo to the value of the first matching case', t => {

      const result1 = $.switch ( 1, [[1, '1'], [2, '2'], [1, '1.1']] );

      t.is ( result1 (), '1' );

      const result2 = $.switch ( 2, [[1, '1'], [2, '2'], [1, '1.1']] );

      t.is ( result2 (), '2' );

    });

    it ( 'returns a memo to undefined if no condition matches and there is no default case', t => {

      const result = $.switch ( 1, [[2, '2'], [3, '3']] );

      t.is ( result (), undefined );

    });

    it ( 'returns a memo to fallback if no condition matches and there is no default case', t => {

      const result = $.switch ( 1, [[2, '2'], [3, '3']], 123 );

      t.is ( result (), 123 );

    });

    it ( 'treats 0 and -0 as different values', t => {

      const condition = $(0);

      const memo = $.switch ( condition, [[0, '0'], [-0, '-0']] );

      t.is ( memo (), '0' );

      condition ( -0 );

      t.is ( memo (), '-0' );

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

    it ( 'returns a memo to the first or second value with a functional condition', t => {

      const o = $(false);

      const result = $.ternary ( o, 123, 321 );

      t.is ( result (), 321 );

      o ( true );

      t.is ( result (), 123 );

      o ( false );

      t.is ( result (), 321 );

    });

    it ( 'returns a memo to the first value with a truthy condition', t => {

      t.is ( $.ternary ( true, 123, 321 )(), 123 );
      t.is ( $.ternary ( 'true', 123, 321 )(), 123 );

    });

    it ( 'returns a memo to the value with a falsy condition', t => {

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

      const memo = $.tryCatch ( regular, fallback );

      t.is ( memo ()(), 'regular' );

      o ( true );

      t.true ( err instanceof Error );
      t.is ( err.message, 'whoops' );

      t.is ( memo (), 'fallback' );

      o ( false );

      recover ();

      t.is ( memo ()(), 'regular' );

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

  describe ( 'untrack', it => {

    it ( 'does not leak memos', t => {

      const o = $(1);

      let cleaned = false;

      $.memo ( () => {

        o ();

        $.untrack ( () => {

          $.memo ( () => {

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

        $.untrack ( () => {

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

    it ( 'does not leak reactions', t => {

      const o = $(1);

      let cleaned = false;

      $.reaction ( () => {

        o ();

        $.untrack ( () => {

          $.reaction ( () => {

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

        t.is ( value, $.untrack ( value ) );

      }

    });

    it ( 'supports getting without creating dependencies in a memo', t => {

      const a = $(1);
      const b = $(2);
      const c = $(3);
      const d = $(0);

      let calls = 0;

      $.memo ( () => {
        calls += 1;
        a ();
        a ();
        d ( $.untrack ( () => b () ) );
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
        d ( $.untrack ( () => b () ) );
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

    it ( 'supports getting without creating dependencies in a reaction', t => {

      const a = $(1);
      const b = $(2);
      const c = $(3);
      const d = $(0);

      let calls = 0;

      $.reaction ( () => {
        calls += 1;
        a ();
        a ();
        d ( $.untrack ( () => b () ) );
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

    it ( 'works with functions containing a memo', t => {

      const o = $(0);

      let calls = 0;

      $.effect ( () => {

        calls += 1;

        $.untrack ( () => {

          o ();

          $.memo ( () => {

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

        $.untrack ( () => {

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

    it ( 'works with functions containing a reaction', t => {

      const o = $(0);

      let calls = 0;

      $.reaction ( () => {

        calls += 1;

        $.untrack ( () => {

          o ();

          $.reaction ( () => {

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

        $.untrack ( () => {

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

        $.untrack ( () => {

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

  describe ( 'with', it => {

    it ( 'calls the functions with no arguments, even for a root', t => {

      $.root ( () => {

        const token = Symbol ();

        $.context ( token, 123 );

        const runWithRoot = $.with ();

        runWithRoot ( ( ...args ) => {

          t.deepEqual ( args, [] );

        });

      });

    });

    it ( 'can execute a function as if it happend inside another owner', t => {

      $.root ( () => {

        const token = Symbol ();

        $.context ( token, 123 );

        const runWithRoot = $.with ();

        $.effect ( () => {

          $.context ( token, 321 );

          const value = $.context ( token );

          t.is ( value, 321 );

          runWithRoot ( () => {

            const value = $.context ( token );

            t.is ( value, 123 );

          });

        });

      });

    });

    it ( 'returns whatever the function returns', t => {

      t.is ( $.with ()( () => 123 ), 123 );

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

      const b1 = $.memo ( () => {
        sequence += 'b1';
        const val = a1 () + 1;
        return val;
      });

      const b2 = $.memo ( () => {
        sequence += 'b2';
        return a1 () + 1;
      });

      const c1 = $.memo ( () => {
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

      const f1 = $.memo ( () => {
        return d ();
      });

      const f2 = $.memo ( () => {
        return d ();
      });

      const f3 = $.memo ( () => {
        return d ();
      });

      const f4 = $.memo ( () => {
        return d ();
      });

      const f5 = $.memo ( () => {
        return d ();
      });

      const g = $.memo ( () => {
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

      const f1 = $.memo ( () => {
        return d ();
      });

      const f2 = $.memo ( () => {
        return d ();
      });

      const f3 = $.memo ( () => {
        return d ();
      });

      const g1 = $.memo ( () => {
        return f1 () + f2 () + f3 ();
      });

      const g2 = $.memo ( () => {
        return f1 () + f2 () + f3 ();
      });

      const g3 = $.memo ( () => {
        return f1 () + f2 () + f3 ();
      });

      const h = $.memo ( () => {
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
        $.memo ( () => {
          childValue = o ();
          calls += 1;
        });
      };

      const child2 = o => {
        $.memo ( () => {
          childValue2 = o ();
        });
      };

      $.memo ( () => {
        const value = !!o ();
        cache ( value );
        return value;
      });

      // 1st

      $.memo ( () => {
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

    it ( 'parent supports going from one to two subscriptions', t => {

      const a = $(0);
      const b = $(0);

      let calls = 0;

      $.memo ( () => {

        calls += 1;

        if ( !a () ) return;

        b ();

      });

      t.is ( calls, 1 );

      a ( 1 );

      t.is ( calls, 2 );

      a ( 2 );

      t.is ( calls, 3 );

      b ( 1 );

      t.is ( calls, 4 );

    });

    it ( 'parent cleans up inner conditional subscriptions', t => {

      const o = $(null);
      const cache = $(false);

      let calls = 0;
      let childValue;

      const child = o => {
        $.memo ( () => {
          childValue = o ();
          calls += 1;
        });
        return 'Hi';
      };

      $.memo ( () => {
        const value = !!o ();
        cache ( value );
        return value;
      });

      const memo = $.memo ( () => {
        const cached = cache ();
        return cached ? child ( o ) : undefined;
      });

      let view;

      $.memo ( () => {
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
