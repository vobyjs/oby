
/* IMPORT */

import {describe} from 'fava';
import {setTimeout as delay} from 'node:timers/promises';
import $ from '../dist/index.js';
import isObservableFrozen from '../dist/methods/is_observable_frozen.js';
import isObservableReadable from '../dist/methods/is_observable_readable.js';
import isObservableWritable from '../dist/methods/is_observable_writable.js';
import {SYMBOL_STORE_VALUES, SYMBOL_UNTRACKED} from '../dist/symbols.js';
import {observable} from '../dist/index.js';

/* HELPERS */

const isFrozen = ( t, value ) => {

  t.true ( $.isObservable ( value ) );
  t.true ( isObservableFrozen ( value ) );
  t.true ( typeof value.read === 'undefined' );
  t.true ( typeof value.write === 'undefined' );
  t.true ( typeof value.value === 'undefined' );
  t.true ( typeof value.bind === 'function' );
  t.true ( typeof value.apply === 'function' );

  t.throws ( () => value ( Math.random () ), { message: 'A readonly Observable can not be updated' } );

};

const isReadable = ( t, value ) => {

  t.true ( $.isObservable ( value ) );
  t.true ( isObservableFrozen ( value ) || isObservableReadable ( value ) );
  // t.true ( isObservableReadable ( value ) );
  t.true ( typeof value.read === 'undefined' );
  t.true ( typeof value.write === 'undefined' );
  t.true ( typeof value.value === 'undefined' );
  t.true ( typeof value.bind === 'function' );
  t.true ( typeof value.apply === 'function' );

  t.throws ( () => value ( Math.random () ), { message: 'A readonly Observable can not be updated' } );

};

const isWritable = ( t, value ) => {

  t.true ( $.isObservable ( value ) );
  t.true ( isObservableWritable ( value ) );
  t.true ( typeof value.read === 'undefined' );
  t.true ( typeof value.write === 'undefined' );
  t.true ( typeof value.value === 'undefined' );
  t.true ( typeof value.bind === 'function' );
  t.true ( typeof value.apply === 'function' );

};

const call = fn => {

  return fn ();

};

const settle = value => {

  let resolvedValue;

  $.effect ( () => {

    let temp = value;

    while ( typeof temp === 'function' ) {

      temp = temp ();

    }

    resolvedValue = temp;

  }, { sync: true } );

  return resolvedValue;

};

const tick = () => {

  return delay ( 1 );

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

      const memo = $.memo ( () => {
        calls += 1;
        return o ();
      });

      t.is ( calls, 0 );
      t.is ( memo (), 1 );
      t.is ( calls, 1 );

      o ( 2 );

      t.is ( calls, 1 );
      t.is ( memo (), 2 );
      t.is ( calls, 2 );

      o ( 3 );

      t.is ( calls, 2 );
      t.is ( memo (), 3 );
      t.is ( calls, 3 );

    });

    it ( 'creates a dependency in an effect when getting', async t => {

      const o = $(1);

      let calls = 0;

      $.effect ( () => {
        calls += 1;
        o ();
      });

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 1 );

      o ( 2 );

      t.is ( calls, 1 );
      await tick ();
      t.is ( calls, 2 );

      o ( 3 );

      t.is ( calls, 2 );
      await tick ();
      t.is ( calls, 3 );

    });

    it ( 'creates a single dependency in a memo even if getting multiple times', t => {

      const o = $(1);

      let calls = 0;

      const memo = $.memo ( () => {
        calls += 1;
        o ();
        o ();
        o ();
        return o ();
      });

      t.is ( calls, 0 );
      t.is ( memo (), 1 );
      t.is ( calls, 1 );

      o ( 2 );

      t.is ( calls, 1 );
      t.is ( memo (), 2 );
      t.is ( calls, 2 );

      o ( 3 );

      t.is ( calls, 2 );
      t.is ( memo (), 3 );
      t.is ( calls, 3 );

    });

    it ( 'creates a single dependency in an effect even if getting multiple times', async t => {

      const o = $(1);

      let calls = 0;

      $.effect ( () => {
        calls += 1;
        o ();
        o ();
        o ();
      });

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 1 );

      o ( 2 );

      t.is ( calls, 1 );
      await tick ();
      t.is ( calls, 2 );

      o ( 3 );

      t.is ( calls, 2 );
      await tick ();
      t.is ( calls, 3 );

    });

    it ( 'does not create a dependency in a memo when instantiating', t => {

      let o;
      let calls = 0;

      const memo = $.memo ( () => {
        calls += 1;
        o = $(1);
      });

      t.is ( calls, 0 );
      t.is ( memo (), undefined );
      t.is ( calls, 1 );

      o ( 2 );

      t.is ( calls, 1 );
      t.is ( memo (), undefined );
      t.is ( calls, 1 );

    });

    it ( 'does not create a dependency in an effect when instantiating', async t => {

      let o;
      let calls = 0;

      $.effect ( () => {
        calls += 1;
        o = $(1);
      });

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 1 );

      o ( 2 );

      t.is ( calls, 1 );
      await tick ();
      t.is ( calls, 1 );

    });

    it ( 'does not create a dependency in a memo when setting', t => {

      let o = $(1);
      let calls = 0;

      const memo = $.memo ( () => {
        calls += 1;
        o ( 2 );
      });

      t.is ( calls, 0 );
      t.is ( memo (), undefined );
      t.is ( calls, 1 );

      o ( 5 );

      t.is ( calls, 1 );
      t.is ( memo (), undefined );
      t.is ( calls, 1 );

    });

    it ( 'does not create a dependency in an effect when setting', async t => {

      let o = $(1);
      let calls = 0;

      $.effect ( () => {
        calls += 1;
        o ( 2 );
      });

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 1 );

      o ( 5 );

      t.is ( calls, 1 );
      await tick ();
      t.is ( calls, 1 );

    });

    it ( 'does not create a dependency in a memo when setting with a function', t => {

      const o = $(1);

      let calls = 0;

      const memo = $.memo ( () => {
        calls += 1;
        o ( prev => prev + 1 );
        o ( prev => prev + 1 );
        o ( prev => prev + 1 );
      });

      t.is ( calls, 0 );
      t.is ( memo (), undefined );
      t.is ( calls, 1 );

      o ( 5 );

      t.is ( calls, 1 );
      t.is ( memo (), undefined );
      t.is ( calls, 1 );

    });

    it ( 'does not create a dependency in an effect when setting with a function', async t => {

      const o = $(1);

      let calls = 0;

      $.effect ( () => {
        calls += 1;
        o ( prev => prev + 1 );
        o ( prev => prev + 1 );
        o ( prev => prev + 1 );
      });

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 1 );

      o ( 5 );

      t.is ( calls, 1 );
      await tick ();
      t.is ( calls, 1 );

    });

    it ( 'does not emit when the setter does not change the value', t => {

      const o = $(1);

      let calls = 0;

      const memo = $.memo ( () => {
        calls += 1;
        return o ();
      });

      const filteredValues = [0, -0, Infinity, NaN, 'foo', true, false, {}, [], Promise.resolve (), new Map (), new Set (), null, undefined, () => {}, Symbol ()];

      for ( const [index, value] of filteredValues.entries () ) {

        const callsExpectedBefore = index;
        const callsExpectedAfter = index + 1;

        t.is ( calls, callsExpectedBefore );

        o ( () => value );

        t.is ( calls, callsExpectedBefore );
        t.is ( memo (), value );
        t.is ( calls, callsExpectedAfter );

        o ( () => value );

        t.is ( calls, callsExpectedAfter );
        t.is ( memo (), value );
        t.is ( calls, callsExpectedAfter );

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

    it ( 'supports a false equality function', async t => {

      const equals = false;

      const o = $( { foo: true }, { equals } );

      let calls = 0;

      $.effect ( () => {
        calls += 1;
        o ();
      });

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 1 );

      o ( o () );

      t.is ( calls, 1 );
      await tick ();
      t.is ( calls, 2 );

      o ( value => ({ ...value }) );

      t.is ( calls, 2 );
      await tick ();
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

    it ( 'batches synchronous changes implicitly, for a memo', t => {

      const a = $(0);
      const b = $(1);

      let calls = 0;

      const memo = $.memo ( () => {
        calls += 1;
        return a () + b ();
      });

      t.is ( calls, 0 );
      t.is ( memo (), 1 );
      t.is ( calls, 1 );

      a ( 10 );
      b ( 100 );

      t.is ( calls, 1 );
      t.is ( memo (), 110 );
      t.is ( calls, 2 );

    });

    it ( 'batches synchronous changes implicitly, for an effect', async t => {

      const a = $(0);
      const b = $(1);

      let calls = 0;

      $.effect ( () => {
        calls += 1;
        a ();
        b ();
      });

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 1 );

      a ( 10 );
      b ( 100 );

      t.is ( calls, 1 );
      await tick ();
      t.is ( calls, 2 );

    });

    it ( 'batches asynchronous changes implicitly, for a memo', async t => {

      const a = $(0);
      const b = $(1);

      let calls = 0;

      const memo = $.memo ( () => {
        calls += 1;
        return a () + b ();
      });

      t.is ( calls, 0 );
      t.is ( memo (), 1 );
      t.is ( calls, 1 );

      a ( 10 );
      await tick ();
      b ( 100 );

      t.is ( calls, 1 );
      t.is ( memo (), 110 );
      t.is ( calls, 2 );

    });

    it ( 'batches asynchronous changes manually, for a memo', async t => {

      const a = $(0);
      const b = $(1);

      let calls = 0;

      const memo = $.memo ( () => {
        calls += 1;
        return a () + b ();
      });

      t.is ( calls, 0 );
      t.is ( memo (), 1 );
      t.is ( calls, 1 );

      await $.batch ( async () => {

        a ( 10 );
        await tick ();
        b ( 100 );

        t.is ( calls, 1 );
        t.is ( memo (), 110 );
        t.is ( calls, 2 );

      });

    });

    it ( 'batches asynchronous changes manually, for an effect', async t => {

      const a = $(0);
      const b = $(1);

      let calls = 0;

      $.effect ( () => {
        calls += 1;
        a ();
        b ();
      });

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 1 );

      await $.batch ( async () => {
        a ( 10 );
        await tick ();
        b ( 100 );
        t.is ( calls, 1 );
      });

      await tick ();

      t.is ( calls, 2 );

    });

    it ( 'does not batch synchronous changes implicitly, for a manually pulled memo', async t => {

      const a = $(0);
      const b = $(1);

      let calls = 0;

      const memo = $.memo ( () => {
        calls += 1;
        return a () + b ();
      });

      t.is ( calls, 0 );
      t.is ( memo (), 1 );
      t.is ( calls, 1 );

      a ( 10 );

      t.is ( calls, 1 );
      t.is ( memo (), 11 );
      t.is ( calls, 2 );

      b ( 100 );

      t.is ( calls, 2 );
      t.is ( memo (), 110 );
      t.is ( calls, 3 );

    });

    it ( 'does not batch synchronous changes implicitly, for a synchronous effect', t => {

      const a = $(0);
      const b = $(1);

      let calls = 0;

      $.effect ( () => {
        calls += 1;
        a ();
        b ();
      }, { sync: true } );

      t.is ( calls, 1 );

      a ( 10 );

      t.is ( calls, 2 );

      b ( 100 );

      t.is ( calls, 3 );

    });

    it ( 'does not batch synchronous changes implicitly, for a synchronous memo', t => {

      const a = $(0);
      const b = $(1);

      let calls = 0;

      $.memo ( () => {
        calls += 1;
        a ();
        b ();
      }, { sync: true } );

      t.is ( calls, 1 );

      a ( 10 );

      t.is ( calls, 2 );

      b ( 100 );

      t.is ( calls, 3 );

    });

    it ( 'does not batch synchronous changes manually, for a synchronous effect', async t => {

      const a = $(0);
      const b = $(1);

      let calls = 0;

      $.effect ( () => {
        calls += 1;
        a ();
        b ();
      }, { sync: true } );

      t.is ( calls, 1 );

      await $.batch ( () => {
        a ( 10 );
        b ( 100 );
        t.is ( calls, 3 );
      });

    });

    it ( 'does not batch synchronous changes manually, for a synchronous memo', async t => {

      const a = $(0);
      const b = $(1);

      let calls = 0;

      $.memo ( () => {
        calls += 1;
        a ();
        b ();
      }, { sync: true } );

      t.is ( calls, 1 );

      await $.batch ( () => {
        a ( 10 );
        b ( 100 );
        t.is ( calls, 3 );
      });

    });

    it ( 'does not batch asynchronous changes implicitly, for an effect', async t => {

      const a = $(0);
      const b = $(1);

      let calls = 0;

      $.effect ( () => {
        calls += 1;
        a ();
        b ();
      });

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 1 );

      a ( 10 );

      t.is ( calls, 1 );
      await tick ();
      t.is ( calls, 2 );

      b ( 100 );

      t.is ( calls, 2 );
      await tick ();
      t.is ( calls, 3 );

    });

    it ( 'does not swallow thrown errors, for sync functions', async t => {

      try {

        await $.batch ( () => {

          throw new Error ( 'Something' );

        });

      } catch ( error ) {

        t.true ( error instanceof Error );
        t.is ( error.message, 'Something' );

      }

    });

    it ( 'does not swallow thrown errors, for async functions', async t => {

      try {

        await $.batch ( async () => {

          await tick ();

          throw new Error ( 'Something' );

        });

      } catch ( error ) {

        t.true ( error instanceof Error );
        t.is ( error.message, 'Something' );

      }

    });

    it ( 'returns the value being returned, wrapped in a promise, for sync functions', async t => {

      const o = $(0);

      const result = $.batch ( () => o () );

      t.true ( result instanceof Promise );
      t.is ( await result, 0 );

    });

    it ( 'returns the value being returned, wrapped in a promise, for async functions', async t => {

      const o = $(0);

      const result = $.batch ( async () => {
        await tick ();
        return o ();
      });

      t.true ( result instanceof Promise );
      t.is ( await result, 0 );

    });

    it ( 'supports being nested', async t => {

      const a = $(0);
      const b = $(1);

      let calls = 0;

      $.effect ( () => {
        calls += 1;
        a ();
        b ();
      });

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 1 );

      await $.batch ( async () => {
        a ( 10 );
        await tick ();
        await $.batch ( async () => {
          b ( 100 );
        });
        await tick ();
        t.is ( calls, 1 );
      });

      await tick ();

      t.is ( calls, 2 );

    });

    it ( 'supports multiple concurrent batch calls', async t => {

      const a = $(0);
      const b = $(1);

      let calls = 0;

      $.effect ( () => {
        calls += 1;
        a ();
        b ();
      });

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 1 );

      const b1 = $.batch ( async () => {
        a ( 10 );
        await delay ( 10 );
      });

      const b2 = $.batch ( async () => {
        b ( 100 );
        await delay ( 50 );
      });

      await Promise.all ([ b1, b2 ]);

      await tick ();

      t.is ( calls, 2 );

    });

  });

  describe ( 'boolean', it => {

    it ( 'returns a boolean for static values', t => {

      t.true ( $.boolean ( 'true' ) );
      t.false ( $.boolean ( '' ) );

    });

    it ( 'returns a function for dynamic values', t => {

      const o = $('true');
      const bool = $.boolean ( o );

      t.true ( bool () );

      o ( '' );

      t.false ( bool () );

    });

  });

  describe ( 'cleanup', it => {

    it ( 'calls callbacks in reverse order', async t => {

      let sequence = '';

      const dispose = $.root ( dispose => {

        $.effect ( () => {

          $.cleanup ( () => sequence += 'a' );

          $.effect ( () => {

            $.cleanup ( () => sequence += 'A' );

            $.cleanup ( () => sequence += 'B' );

          });

          $.effect ( () => {

            $.cleanup ( () => sequence += 'C' );

            $.cleanup ( () => sequence += 'D' );

          });

          $.cleanup ( () => sequence += 'b' );

        });

        return dispose;

      });

      await tick ();

      t.is ( sequence, '' );

      dispose ();

      t.is ( sequence , 'DCBAba' );

    });

    it ( 'does not cause the parent memo to re-execute', t => {

      const disposed = $(false);

      let calls = 0;

      const memo = $.memo ( () => {

        calls += 1;

        if ( disposed () ) return;

        const o = $(0);

        o ( 0 );

        $.cleanup ( () => {

          o ( o () + Math.random () );

        });

      });

      t.is ( calls, 0 );
      t.is ( memo (), undefined );
      t.is ( calls, 1 );

      disposed ( true );

      t.is ( calls, 1 );
      t.is ( memo (), undefined );
      t.is ( calls, 2 );

    });

    it ( 'does not cause the parent effect to re-execute', async t => {

      const disposed = $(false);

      let calls = 0;

      $.effect ( () => {

        calls += 1;

        if ( disposed () ) return;

        const o = $(0);

        o ( 0 );

        $.cleanup ( () => {

          o ( o () + Math.random () );

        });

      });

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 1 );

      disposed ( true );

      t.is ( calls, 1 );
      await tick ();
      t.is ( calls, 2 );

    });

    it ( 'registers a function to be called when the parent computation is disposed', t => {

      let sequence = '';

      $.root ( dispose => {

        const memo = $.memo ( () => {

          $.cleanup ( () => {
            sequence += 'a';
          });

          $.cleanup ( () => {
            sequence += 'b';
          });

        });

        memo ();
        dispose ();

      });

      t.is ( sequence, 'ba' );

    });

    it ( 'registers a function to be called when the parent computation updates', t => {

      const o = $(0);

      let sequence = '';

      const memo = $.memo ( () => {

        o ();

        $.cleanup ( () => {
          sequence += 'a';
        });

        $.cleanup ( () => {
          sequence += 'b';
        });

      });

      t.is ( memo (), undefined );
      t.is ( sequence, '' );

      o ( 1 );

      t.is ( memo (), undefined );
      t.is ( sequence, 'ba' );

      o ( 2 );

      t.is ( memo (), undefined );
      t.is ( sequence, 'baba' );

      o ( 3 );

      t.is ( memo (), undefined );
      t.is ( sequence, 'bababa' );

    });

    it ( 'registers a function to be called when the parent effect is disposed', async t => {

      let sequence = '';

      await $.root ( async dispose => {

        $.effect ( () => {

          $.cleanup ( () => {
            sequence += 'a';
          });

          $.cleanup ( () => {
            sequence += 'b';
          });

        });

        await tick ();

        dispose ();

        t.is ( sequence, 'ba' );

      });

    });

    it ( 'registers a function to be called when the parent init effect is disposed', t => {

      let sequence = '';

      $.root ( dispose => {

        $.effect ( () => {

          $.cleanup ( () => {
            sequence += 'a';
          });

          $.cleanup ( () => {
            sequence += 'b';
          });

        }, { sync: 'init' } );

        dispose ();

      });

      t.is ( sequence, 'ba' );

    });

    it ( 'registers a function to be called when the parent sync effect is disposed', t => {

      let sequence = '';

      $.root ( dispose => {

        $.effect ( () => {

          $.cleanup ( () => {
            sequence += 'a';
          });

          $.cleanup ( () => {
            sequence += 'b';
          });

        }, { sync: true } );

        dispose ();

      });

      t.is ( sequence, 'ba' );

    });

    it ( 'registers a function to be called when the parent sync memo is disposed', t => {

      let sequence = '';

      $.root ( dispose => {

        $.memo ( () => {

          $.cleanup ( () => {
            sequence += 'a';
          });

          $.cleanup ( () => {
            sequence += 'b';
          });

        }, { sync: true } );

        dispose ();

      });

      t.is ( sequence, 'ba' );

    });

    it ( 'registers a function to be called when the parent context is disposed', t => {

      let sequence = '';

      $.root ( dispose => {

        $.context ( {}, () => {

          $.cleanup ( () => {
            sequence += 'a';
          });

          $.cleanup ( () => {
            sequence += 'b';
          });

        });

        dispose ();

      });

      t.is ( sequence, 'ba' );

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

      t.is ( sequence, 'ba' );

    });

    it ( 'registers a function to be called when the parent effect updates', async t => {

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

      await tick ();

      t.is ( sequence, '' );

      o ( 1 );

      await tick ();

      t.is ( sequence, 'ba' );

      o ( 2 );

      await tick ();

      t.is ( sequence, 'baba' );

      o ( 3 );

      await tick ();

      t.is ( sequence, 'bababa' );

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

        t.is ( sequence, 'ba' );

        dispose ();
        dispose ();
        dispose ();

        t.is ( sequence, 'ba' );

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

        t.is ( sequence, 'ba' );

      });

    });

    it ( 'returns undefined', t => {

      const result1 = $.cleanup ( () => {} );
      const result2 = $.cleanup ( () => 123 );
      const result3 = $.cleanup ( () => () => {} );

      t.is ( result1, undefined );
      t.is ( result2, undefined );
      t.is ( result3, undefined );

    });

    it ( 'supports a callable object', async t => {

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

      await tick ();

      t.is ( sequence, '' );

      o ( 1 );

      await tick ();

      t.is ( sequence, 'ba' );

      o ( 2 );

      await tick ();

      t.is ( sequence, 'baba' );

      o ( 3 );

      await tick ();

      t.is ( sequence, 'bababa' );

    });

  });

  describe ( 'context', it => {

    it ( 'can read and write context values inside an effect', async t => {

      $.effect ( () => {

        const name = Symbol ();
        const value = { foo: 123 };
        const context = { [name]: value };

        $.context ( context, () => {

          t.is ( $.context ( name ), value );

        });

      });

      await tick ();

    });

    it ( 'can read and write context values inside a memo', t => {

      const memo = $.memo ( () => {

        const name = Symbol ();
        const value = { foo: 123 };
        const context = { [name]: value };

        $.context ( context, () => {

          t.is ( $.context ( name ), value );

        });

      });

      memo ();

    });

    it ( 'can read and write context values inside a root', t => {

      $.root ( () => {

        const name = Symbol ();
        const value = { foo: 123 };
        const context = { [name]: value };

        $.context ( context, () => {

          t.is ( $.context ( name ), value );

        });

      });

    });

    it ( 'can read and write context values inside a suspense', t => {

      $.suspense ( false, () => {

        const name = Symbol ();
        const value = { foo: 123 };
        const context = { [name]: value };

        $.context ( context, () => {

          t.is ( $.context ( name ), value );

        });

      });

    });

    it ( 'can read and write context values inside a deep effect', async t => {

      $.effect ( () => {

        const name = Symbol ();
        const value = { foo: 123 };
        const context = { [name]: value };

        $.context ( context, () => {

          $.effect ( () => {

            t.is ( $.context ( name ), value );

          });

        });

      });

      await tick ();

    });

    it ( 'can read and write context values inside a deep memo', t => {

      const memo1 = $.memo ( () => {

        const name = Symbol ();
        const value = { foo: 123 };
        const context = { [name]: value };

        $.context ( context, () => {

          const memo2 = $.memo ( () => {

            t.is ( $.context ( name ), value );

          });

          memo2 ();

        });

      });

      memo1 ();

    });

    it ( 'can read and write context values inside a deep root', t => {

      $.root ( () => {

        const name = Symbol ();
        const value = { foo: 123 };
        const context = { [name]: value };

        $.context ( context, () => {

          $.root ( () => {

            t.is ( $.context ( name ), value );

          });

        });

      });

    });

    it ( 'can read and write context values inside a deep suspense', t => {

      $.suspense ( false, () => {

        const name = Symbol ();
        const value = { foo: 123 };
        const context = { [name]: value };

        $.context ( context, () => {

          $.suspense ( false, () => {

            t.is ( $.context ( name ), value );

          });

        });

      });

    });

    it ( 'returns whatever the function returns when setting', async t => {

      $.effect ( () => {

        const name = Symbol ();
        const value = { foo: 123 };
        const context = { [name]: value };

        const ret = $.context ( context, () => 123 );

        t.is ( ret, 123 );

      });

      await tick ();

    });

    it ( 'returns undefined for unknown contexts', async t => {

      $.effect ( () => {

        const ctx = Symbol ();

        t.is ( $.context ( ctx ), undefined );

      });

      await tick ();

    });

    it ( 'supports overriding the outer context', t => {

      $.root ( () => {

        const name = Symbol ();
        const value = { foo: 123 };
        const context = { [name]: value };

        $.context ( context, () => {

          t.is ( $.context ( name ), value );

          $.root ( () => {

            const name2 = Symbol ();
            const value2 = { foo: 321 };
            const context2 = { [name2]: value2 };

            $.context ( context2, () => {

              t.is ( $.context ( name ), value );
              t.is ( $.context ( name2 ), value2 );

            });

          });

          t.is ( $.context ( name ), value );

        });

      });

    });

    it ( 'supports setting the value to undefined', async t => {

      $.effect ( () => {

        const name = Symbol ();
        const value = { foo: 123 };
        const contextYes = { [name]: value };
        const contextNo = { [name]: undefined };

        $.context ( contextYes, () => {

          $.context ( contextNo, () => {

            t.is ( $.context ( name ), undefined );

          });

        });

      });

      await tick ();

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

      await tick ();

      a ( 2 );

      await tick ();

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

    it ( 'can not be running multiple times concurrently', async t => {

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

      await tick ();

    });

    it ( 'checks if the returned value is actually a function', async t => {

      await t.notThrowsAsync ( async () => {

        $.effect ( () => 123 );

        await tick ();

      });

    });

    it ( 'cleans up dependencies properly when causing itself to re-execute, scenario 1', async t => {

      const a = $(0);
      const b = $(0);

      let calls = 0;

      $.effect ( () => {

        calls += 1;

        if ( !$.untrack ( a ) ) a ( a () + 1 );

        b ();

      });

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 2 );

      a ( 2 );

      t.is ( calls, 2 );
      await tick ();
      t.is ( calls, 2 );

      b ( 1 );

      t.is ( calls, 2 );
      await tick ();
      t.is ( calls, 3 );

    });

    it ( 'cleans up dependencies properly when causing itself to re-execute, scenario 2', async t => {

      const a = $(0);
      const b = $(0);

      let calls = 0;

      $.effect ( () => {

        calls += 1;

        a ();
        b ( Math.random () );
        b ();

      });

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 1 );

      a ( 2 );

      t.is ( calls, 1 );
      await tick ();
      t.is ( calls, 2 );

    });

    it ( 'cleans up dependencies properly when causing itself to re-execute, scenario 3', async t => {

      const branch = $(false);
      const o = new Array ( 500 ).fill ( 0 ).map ( () => $(0) );
      const oo = [...o, ...o];

      let calls = 0;

      $.effect ( () => {

        calls += 1;

        oo.forEach ( o => o () );

        if ( $.untrack ( branch ) ) return;

        oo.forEach ( o => o () );

      });

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 1 );

      branch ( true );
      o[0]( 1 );

      t.is ( calls, 1 );
      await tick ();
      t.is ( calls, 2 );

      o[0]( 2 );

      t.is ( calls, 2 );
      await tick ();
      t.is ( calls, 3 );

    });

    it ( 'cleans up inner effects', async t => {

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

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 1 );

      active ( false );
      o ( 1 );

      t.is ( calls, 1 );
      await tick ();
      t.is ( calls, 1 );

    });

    it ( 'returns a disposer', async t => {

      const a = $(1);
      const b = $(2);
      const c = $();

      const dispose = $.effect ( () => {
        c ( a () + b () );
      });

      await tick ();

      t.is ( c (), 3 );

      dispose ();

      a ( 2 );

      await tick ();

      t.is ( c (), 3 );

    });

    it ( 'returns undefined to the function', async t => {

      const a = $(1);
      const aPrev = $();

      $.effect ( prev => {

        aPrev ( prev );

        return a ();

      });

      await tick ();

      t.is ( a (), 1 );
      t.is ( aPrev (), undefined );

      a ( 2 );

      await tick ();

      t.is ( a (), 2 );
      t.is ( aPrev (), undefined );

      a ( 3 );

      await tick ();

      t.is ( a (), 3 );
      t.is ( aPrev (), undefined );

      a ( 4 );

      await tick ();

      t.is ( a (), 4 );
      t.is ( aPrev (), undefined );

    });

    it ( 'supports any number of dependencies', async t => {

      for ( const nr of [1, 2, 3, 4, 5] ) {

        const oo = new Array ( nr ).fill ( 0 ).map ( () => $(0) );

        let calls = 0;

        $.effect ( () => {
          calls += 1;
          oo.map ( call );
        });

        t.is ( calls, 0 );
        await tick ();
        t.is ( calls, 1 );

        for ( const [i, o] of Array.from ( oo.entries () ) ) {

          o ( prev => prev + 1 );

          t.is ( calls, i + 1 );
          await tick ();
          t.is ( calls, i + 2 );

        }

      }

    });

    it ( 'supports dynamic dependencies', async t => {

      const a = $(1);
      const b = $(2);
      const c = $();
      const bool = $(false);

      $.effect ( () => {
        c ( bool () ? a () : b () );
      });

      await tick ();

      t.is ( c (), 2 );

      a ( 10 );

      await tick ();

      t.is ( c (), 2 );

      b ( 20 );

      await tick ();

      t.is ( c (), 20 );

      bool ( true );

      await tick ();

      t.is ( c (), 10 );

    });

    it ( 'supports manually registering a function to be called when the parent effect updates', async t => {

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

      await tick ();

      t.is ( sequence, '' );

      o ( 1 );

      await tick ();

      t.is ( sequence, 'ba' );

      o ( 2 );

      await tick ();

      t.is ( sequence, 'baba' );

      o ( 3 );

      await tick ();

      t.is ( sequence, 'bababa' );

    });

    it ( 'supports automatically registering a function to be called when the parent effect updates', async t => {

      const o = $(0);

      let sequence = '';

      $.effect ( () => {

        o ();

        return () => {
          sequence += 'a';
          sequence += 'b';
        };

      });

      await tick ();

      t.is ( sequence, '' );

      o ( 1 );

      await tick ();

      t.is ( sequence, 'ab' );

      o ( 2 );

      await tick ();

      t.is ( sequence, 'abab' );

      o ( 3 );

      await tick ();

      t.is ( sequence, 'ababab' );

    });

    it ( 'supports synchronous effects', t => {

      const o = $(0);

      let calls = 0;

      $.effect ( () => {
        calls += 1;
        o ();
      }, { sync: true } );

      t.is ( calls, 1 );

      o ( 1 );

      t.is ( calls, 2 );

    });

    it ( 'supports synchronous effects only on init', async t => {

      const o = $(0);

      let calls = 0;

      $.effect ( () => {
        calls += 1;
        o ();
      }, { sync: 'init' } );

      t.is ( calls, 1 );

      o ( 1 );

      t.is ( calls, 1 );
      await tick ();
      t.is ( calls, 2 );

    });

    it ( 'supports checking dependecies for updates on synchronous effects also', t => {

      const o = $(0);
      const memo = $.memo ( o, { equals: () => true } );

      let calls = 0;

      $.effect ( () => {

        calls += 1;

        memo ();

      }, { sync: true } );

      t.is ( calls, 1 );

      o ( 1 );

      t.is ( calls, 1 );

    });

    it ( 'supports refreshing itself even if its last dependency did not actually change', t => {

      const o = $(0);
      const memo = $.memo ( () => Math.min ( 0, o () ) );

      let calls = 0;

      $.effect ( () => {
        o ();
        memo ();
        calls += 1;
      });

      t.is ( calls, 0 );
      $.tick ();
      t.is ( calls, 1 );

      o ( 1 );

      t.is ( calls, 1 );
      $.tick ();
      t.is ( calls, 2 );

    });

    it ( 'updates when the dependencies change', async t => {

      const a = $(1);
      const b = $(2);
      const c = $();

      $.effect ( () => {
        c ( a () + b () );
      });

      a ( 3 );
      b ( 7 );

      await tick ();

      t.is ( c (), 10 );

    });

    it ( 'updates when the dependencies change inside other effects', async t => {

      const a = $(0);
      const b = $(0);
      let calls = 0;

      $.effect ( () => {
        calls += 1;
        a ();
      });

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 1 );

      $.effect ( () => {
        a ( 1 );
        b ();
        a ( 0 );
      });

      t.is ( calls, 1 );
      await tick ();
      t.is ( calls, 2 );

      b ( 1 );

      t.is ( calls, 2 );
      await tick ();
      t.is ( calls, 3 );

      a ( 1 );

      t.is ( calls, 3 );
      await tick ();
      t.is ( calls, 4 );

    });

  });

  describe ( 'for', () => {

    describe ( 'keyed', it => {

      it ( 'calls the mapper function with an observable to the index', t => {

        const array = $([ 'a', 'b', 'c' ]);
        const argsRaw = [];
        const args = [];

        const memo = $.for ( array, ( value, index ) => {
          isReadable ( t, index );
          argsRaw.push ( index );
          args.push ( index () );
          return value;
        });

        t.deepEqual ( memo (), ['a', 'b', 'c'] );
        t.deepEqual ( argsRaw.map ( call ), [0, 1, 2] );
        t.deepEqual ( args, [0, 1, 2] );

        array ([ 'a', 'b', 'c', 'd' ]);

        t.deepEqual ( memo (), ['a', 'b', 'c', 'd'] );
        t.deepEqual ( argsRaw.map ( call ), [0, 1, 2, 3] );
        t.deepEqual ( args, [0, 1, 2, 3] );

        array ([ 'd', 'c', 'a', 'b' ]);

        t.deepEqual ( memo (), ['d', 'c', 'a', 'b'] );
        t.deepEqual ( argsRaw.map ( call ), [2, 3, 1, 0] );
        t.deepEqual ( args, [0, 1, 2, 3] );

      });

      it ( 'calls the mapper function with the raw index in some simple cases', t => {

        const array = ['a', 'b', 'c'];
        const args = [];

        const memo = $.for ( array, ( value, index ) => {
          args.push ( index );
          return value;
        });

        t.deepEqual ( memo (), ['a', 'b', 'c'] );
        t.deepEqual ( args, [0, 1, 2] );

      });

      it ( 'disposes of any reactivity when the values array is emptied', t => {

        const array = $([1, 2, 3]);
        const args = [];

        const memo = $.for ( array, value => {
          $.cleanup ( () => {
            args.push ( value );
          });
          return value;
        });

        t.deepEqual ( memo (), [1, 2, 3] );

        array ( [] );

        t.deepEqual ( memo (), [] );
        t.deepEqual ( args, [1, 2, 3] );

      });

      it ( 'disposes of any reactivity when the parent computation is disposed', t => {

        const o1 = $(1);
        const o2 = $(2);
        const array = $([o1, o2]);
        const args = [];

        const dispose = $.root ( dispose => {
          const memo = $.memo ( () => {
            const memo = $.for ( array, value => {
              const memo = $.memo ( () => {
                args.push ( value () );
              });
              memo ();
            });
            memo ();
          });
          memo ();
          return dispose;
        });

        dispose ();

        t.deepEqual ( args, [1, 2] );

        o1 ( 11 );
        o2 ( 22 );

        t.deepEqual ( args, [1, 2] );

      });

      it ( 'disposes of any reactivity when the parent effect is disposed', async t => {

        const o1 = $(1);
        const o2 = $(2);
        const array = $([o1, o2]);
        const args = [];

        const dispose = await $.root ( async dispose => {
          $.effect ( () => {
            const memo = $.for ( array, value => {
              const memo = $.memo ( () => {
                args.push ( value () );
              });
              memo ();
            });
            memo ();
          });
          await tick ();
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
          const memo = $.for ( array, value => {
            const memo = $.memo ( () => {
              args.push ( value () );
            });
            memo ();
          });
          memo ();
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

        const memo = $.for ( array, value => {
          const memo = $.memo ( () => {
            args.push ( value () );
            return value ();
          });
          return memo;
        });

        t.deepEqual ( memo ().map ( call ), [1, 2] );
        t.deepEqual ( args, [1, 2] );

        o1 ( 11 );

        t.deepEqual ( memo ().map ( call ), [11, 2] );
        t.deepEqual ( args, [1, 2, 11] );

        o2 ( 22 );

        t.deepEqual ( memo ().map ( call ), [11, 22] );
        t.deepEqual ( args, [1, 2, 11, 22] );

        array ([ o1 ]);

        t.deepEqual ( memo ().map ( call ), [11] );
        t.deepEqual ( args, [1, 2, 11, 22] );

        o1 ( 111 );

        t.deepEqual ( memo ().map ( call ), [111] );
        t.deepEqual ( args, [1, 2, 11, 22, 111] );

        o2 ( 22 );

        t.deepEqual ( memo ().map ( call ), [111] );
        t.deepEqual ( args, [1, 2, 11, 22, 111] );

      });

      it ( 'disposes of any reactivity created for duplicated items', t => {

        const o = $(1);
        const array = $([o, o]);
        const args = [];

        const memo = $.for ( array, value => {
          const memo = $.memo ( () => {
            args.push ( value () );
            return value ();
          });
          return memo;
        });

        t.deepEqual ( memo ().map ( call ), [1, 1] );
        t.deepEqual ( args, [1, 1] );

        o ( 11 );

        t.deepEqual ( memo ().map ( call ), [11, 11] );
        t.deepEqual ( args, [1, 1, 11, 11] );

        o ( 22 );

        t.deepEqual ( memo ().map ( call ), [22, 22] );
        t.deepEqual ( args, [1, 1, 11, 11, 22, 22] );

        array ([ o ]);

        t.deepEqual ( memo ().map ( call ), [22] );
        t.deepEqual ( args, [1, 1, 11, 11, 22, 22] );

        o ( 111 );

        t.deepEqual ( memo ().map ( call ), [111] );
        t.deepEqual ( args, [1, 1, 11, 11, 22, 22, 111] );

      });

      it ( 'renders only results for unknown values', t => {

        const array = $([1, 2, 3]);
        const args = [];

        const memo = $.for ( array, value => {
          args.push ( value );
          return value;
        });

        t.deepEqual ( memo (), [1, 2, 3] );
        t.deepEqual ( args, [1, 2, 3] );

        array ([ 1, 2, 3, 4 ]);

        t.deepEqual ( memo (), [1, 2, 3, 4] );
        t.deepEqual ( args, [1, 2, 3, 4] );

        array ([ 1, 2, 3, 4, 5 ]);

        t.deepEqual ( memo (), [1, 2, 3, 4, 5] );
        t.deepEqual ( args, [1, 2, 3, 4, 5] );

      });

      it ( 'resolves the fallback value before returning it', t => {

        const result = $.for ( [], () => () => 123, () => () => 321 );

        isReadable ( t, result );
        isReadable ( t, result () );
        isReadable ( t, result ()() );

        t.is ( result ()()(), 321 );

      });

      it ( 'resolves the fallback once value before returning it, even if needed multiple times in a sequence', t => {

        const o = $([]);

        let calls = 0;

        const memo = $.for ( o, () => () => 123, () => () => {
          calls += 1;
          return 321;
        });

        t.is ( calls, 0 );
        t.is ( memo ()()(), 321 );
        t.is ( calls, 1 );

        o ( [] );

        t.is ( calls, 1 );
        t.is ( memo ()()(), 321 );
        t.is ( calls, 1 );

        o ( [] );

        t.is ( calls, 1 );
        t.is ( memo ()()(), 321 );
        t.is ( calls, 1 );

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

      it ( 'returns a memo to the same array if all values were cached', t => {

        const external = $(0);
        const values = $([1, 2, 3]);

        const valuesWithExternal = () => {
          external ();
          return values ();
        };

        let calls = 0;

        const result = $.for ( valuesWithExternal, value => {
          calls += 1;
          return value;
        });

        t.is ( calls, 0 );

        const result1 = result ();

        t.is ( calls, 3 );
        t.deepEqual ( result1, [1, 2, 3] );

        external ( 1 );

        const result2 = result ();

        t.is ( calls, 3 );
        t.deepEqual ( result2, [1, 2, 3] );
        t.is ( result1, result2 );

        values ([ 3, 2, 1 ]);

        const result3 = result ();

        t.is ( calls, 3 );
        t.deepEqual ( result3, [3, 2, 1] );
        t.not ( result1, result3 );

        values ([ 3, 2 ]);

        const result4 = result ();

        t.is ( calls, 3 );
        t.deepEqual ( result4, [3, 2] );

        external ( 2 );

        const result5 = result ();

        t.is ( calls, 3 );
        t.deepEqual ( result5, [3, 2] );
        t.is ( result4, result5 );

      });

      it ( 'works with an undefined array', t => {

        const memo = $.for ( undefined, t.fail );

        t.deepEqual ( memo ().map ( call ), [] );

      });

      it ( 'works with an array of non-unique values', t => {

        const array = $([ 1, 1, 2 ]);
        const args = [];

        const memo = $.for ( array, value => {
          const memo = $.memo ( () => {
            args.push ( value );
            return value;
          });
          return memo;
        });

        t.deepEqual ( memo ().map ( call ), [1, 1, 2] );
        t.deepEqual ( args, [1, 1, 2] );

        array ([ 2, 2, 1 ]);

        t.deepEqual ( memo ().map ( call ), [2, 2, 1] );
        t.deepEqual ( args, [1, 1, 2, 2] );

      });

    });

    describe ( 'unkeyed', it => {

      it ( 'calls the mapper function with an observable to the index', t => {

        const array = $([ 'a', 'b', 'c' ]);
        const argsRaw = [];
        const args = [];

        const memo = $.for ( array, ( value, index ) => {
          isReadable ( t, index );
          argsRaw.push ( index );
          args.push ( index () );
          return value;
        }, [], { unkeyed: true } );

        t.deepEqual ( memo ().map ( call ), ['a', 'b', 'c'] );
        t.deepEqual ( argsRaw.map ( call ), [0, 1, 2] );
        t.deepEqual ( args, [0, 1, 2] );

        array ([ 'a', 'b', 'c', 'd' ]);

        t.deepEqual ( memo ().map ( call ), ['a', 'b', 'c', 'd'] );
        t.deepEqual ( argsRaw.map ( call ), [0, 1, 2, 3] );
        t.deepEqual ( args, [0, 1, 2, 3] );

        array ([ 'd', 'c', 'a', 'b' ]);

        t.deepEqual ( memo ().map ( call ), ['d', 'c', 'a', 'b'] );
        t.deepEqual ( argsRaw.map ( call ), [2, 3, 1, 0] );
        t.deepEqual ( args, [0, 1, 2, 3] );

      });

      it ( 'calls the mapper function with the raw index in some simple cases', t => {

        const array = ['a', 'b', 'c'];
        const args = [];

        const memo = $.for ( array, ( value, index ) => {
          args.push ( index );
          return value;
        }, { unkeyed: true });

        t.deepEqual ( memo (), ['a', 'b', 'c'] );
        t.deepEqual ( args, [0, 1, 2] );

      });

      it ( 'calls the mapper function with an observable to the value', t => {

        const array = $([ 'a', 'b', 'c' ]);
        const argsRaw = [];
        const args = [];

        const memo = $.for ( array, ( value ) => {
          isReadable ( t, value );
          argsRaw.push ( value );
          args.push ( value () );
          return value;
        }, [], { unkeyed: true } );

        t.deepEqual ( memo ().map ( call ), ['a', 'b', 'c'] );
        t.deepEqual ( argsRaw.map ( call ), ['a', 'b', 'c'] );
        t.deepEqual ( args, ['a', 'b', 'c'] );

        array ([ 'a', 'b', 'c', 'd' ]);

        t.deepEqual ( memo ().map ( call ), ['a', 'b', 'c', 'd'] );
        t.deepEqual ( argsRaw.map ( call ), ['a', 'b', 'c', 'd'] );
        t.deepEqual ( args, ['a', 'b', 'c', 'd'] );

        array ([ 'e', 'b', 'c', 'd' ]);

        t.deepEqual ( memo ().map ( call ), ['e', 'b', 'c', 'd'] );
        t.deepEqual ( argsRaw.map ( call ), ['e', 'b', 'c', 'd'] );
        t.deepEqual ( args, ['a', 'b', 'c', 'd'] );

      });

      it ( 'disposes of any reactivity when the values array is emptied', t => {

        const array = $([1, 2, 3]);
        const args = [];

        const memo = $.for ( array, value => {
          $.cleanup ( () => {
            args.push ( value () );
          });
          return value;
        }, [], { unkeyed: true } );

        t.deepEqual ( memo ().map ( call ), [1, 2, 3] );
        t.deepEqual ( args, [] );

        array ( [] );

        t.deepEqual ( memo ().map ( call ), [] );
        t.deepEqual ( args, [1, 2, 3] );

      });

      it ( 'disposes of any reactivity when the parent computation is disposed', async t => {

        const o1 = $(1);
        const o2 = $(2);
        const array = $([o1, o2]);
        const args = [];

        const dispose = $.root ( dispose => {
          const memo = $.memo ( () => {
            const memo = $.for ( array, value => {
              const memo = $.memo ( () => {
                args.push ( value () );
              });
              $.effect ( () => {
                memo ();
              });
              return memo;
            }, [], { unkeyed: true } );
            memo ();
          });
          memo ();
          return dispose;
        });

        t.deepEqual ( args, [] );
        await tick ();
        t.deepEqual ( args, [1, 2] );

        dispose ();

        t.deepEqual ( args, [1, 2] );

        o1 ( 11 );
        o2 ( 22 );

        t.deepEqual ( args, [1, 2] );
        await tick ();
        t.deepEqual ( args, [1, 2] );

      });

      it ( 'disposes of any reactivity when the parent effect is disposed', async t => {

        const o1 = $(1);
        const o2 = $(2);
        const array = $([o1, o2]);
        const args = [];

        const dispose = $.root ( dispose => {
          $.effect ( () => {
            const memo = $.for ( array, value => {
              const memo = $.memo ( () => {
                args.push ( value () );
              });
              $.effect ( () => {
                memo ();
              });
              return memo;
            }, [], { unkeyed: true } );
            memo ();
          });
          return dispose;
        });

        t.deepEqual ( args, [] );
        await tick ();
        t.deepEqual ( args, [1, 2] );

        dispose ();

        t.deepEqual ( args, [1, 2] );

        o1 ( 11 );
        o2 ( 22 );

        t.deepEqual ( args, [1, 2] );
        await tick ();
        t.deepEqual ( args, [1, 2] );

      });

      it ( 'disposes of any reactivity when the parent root is disposed', async t => {

        const o1 = $(1);
        const o2 = $(2);
        const array = $([o1, o2]);
        const args = [];

        const dispose = $.root ( dispose => {
          const memo = $.for ( array, value => {
            const memo = $.memo ( () => {
              args.push ( value () );
            });
            $.effect ( () => {
              memo ();
            });
            return memo;
          }, [], { unkeyed: true } );
          $.effect ( () => {
            memo ();
          });
          return dispose;
        });

        t.deepEqual ( args, [] );
        await tick ();
        t.deepEqual ( args, [1, 2] );

        dispose ();

        t.deepEqual ( args, [1, 2] );

        o1 ( 11 );
        o2 ( 22 );

        t.deepEqual ( args, [1, 2] );
        await tick ();
        t.deepEqual ( args, [1, 2] );

      });

      it ( 'disposes of any reactivity created for items that got deleted', async t => {

        const o1 = $(1);
        const o2 = $(2);
        const array = $([o1, o2]);
        const args = [];

        const memo = $.for ( array, value => {
          const memo = $.memo ( () => {
            args.push ( value () );
            return value ();
          }, [], { unkeyed: true } );
          return memo;
        });

        t.deepEqual ( memo ().map ( call ), [1, 2] );
        t.deepEqual ( args, [1, 2] );

        o1 ( 11 );

        t.deepEqual ( memo ().map ( call ), [11, 2] );
        t.deepEqual ( args, [1, 2, 11] );

        o2 ( 22 );

        t.deepEqual ( memo ().map ( call ), [11, 22] );
        t.deepEqual ( args, [1, 2, 11, 22] );

        array ([ o1 ]);

        t.deepEqual ( memo ().map ( call ), [11] );
        t.deepEqual ( args, [1, 2, 11, 22] );

        o1 ( 111 );

        t.deepEqual ( memo ().map ( call ), [111] );
        t.deepEqual ( args, [1, 2, 11, 22, 111] );

        o2 ( 22 );

        t.deepEqual ( memo ().map ( call ), [111] );
        t.deepEqual ( args, [1, 2, 11, 22, 111] );

      });

      it ( 'disposes of any reactivity created for duplicated items', t => {

        const o = $(1);
        const array = $([o, o]);
        const args = [];

        const memo = $.for ( array, value => {
          return $.memo ( () => {
            args.push ( value () );
            return value ();
          }, [], { unkeyed: true } );
        });

        t.deepEqual ( memo ().map ( call ), [1, 1] );
        t.deepEqual ( args, [1, 1] );

        o ( 11 );

        t.deepEqual ( memo ().map ( call ), [11, 11] );
        t.deepEqual ( args, [1, 1, 11, 11] );

        o ( 22 );

        t.deepEqual ( memo ().map ( call ), [22, 22] );
        t.deepEqual ( args, [1, 1, 11, 11, 22, 22] );

        array ([ o ]);

        t.deepEqual ( memo ().map ( call ), [22] );
        t.deepEqual ( args, [1, 1, 11, 11, 22, 22] );

        o ( 111 );

        t.deepEqual ( memo ().map ( call ), [111] );
        t.deepEqual ( args, [1, 1, 11, 11, 22, 22, 111] );

      });

      it ( 'renders only results for unknown values', t => {

        const array = $([1, 2, 3]);
        const args = [];

        const memo = $.for ( array, value => {
          args.push ( value () );
          return value;
        }, [], { unkeyed: true } );

        t.deepEqual ( memo ().map ( call ), [1, 2, 3] );
        t.deepEqual ( args, [1, 2, 3] );

        array ([ 1, 2, 3, 4 ]);

        t.deepEqual ( memo ().map ( call ), [1, 2, 3, 4] );
        t.deepEqual ( args, [1, 2, 3, 4] );

        array ([ 1, 2, 3, 4, 5 ]);

        t.deepEqual ( memo ().map ( call ), [1, 2, 3, 4, 5] );
        t.deepEqual ( args, [1, 2, 3, 4, 5] );

      });

      it ( 'reuses leftover items if possible', t => {

        const array = $([1, 2, 3]);
        const argsRaw = [];
        const args = [];

        const memo = $.for ( array, value => {
          argsRaw.push ( value );
          args.push ( value () );
          return value;
        }, [], { unkeyed: true } );

        t.deepEqual ( memo ().map ( call ), [1, 2, 3] );
        t.deepEqual ( argsRaw.map ( call ), [1, 2, 3] );
        t.deepEqual ( args, [1, 2, 3] );

        array ([ 1, 3, 4, 5 ]);

        t.deepEqual ( memo ().map ( call ), [1, 3, 4, 5] );
        t.deepEqual ( argsRaw.map ( call ), [1, 4, 3, 5] );
        t.deepEqual ( args, [1, 2, 3, 5] );

      });

      it ( 'resolves the fallback value before returning it', t => {

        const result = $.for ( [], () => () => 123, () => () => 321, { unkeyed: true } );

        isReadable ( t, result );
        isReadable ( t, result () );
        isReadable ( t, result ()() );

        t.is ( result ()()(), 321 );

      });

      it ( 'resolves the fallback once value before returning it, even if needed multiple times in a sequence', t => {

        const o = $([]);

        let calls = 0;

        const memo = $.for ( o, () => () => 123, () => () => {
          calls += 1;
          return 321;
        }, { unkeyed: true } );

        t.is ( calls, 0 );
        t.is ( memo ()()(), 321 );
        t.is ( calls, 1 );

        o ( [] );

        t.is ( calls, 1 );
        t.is ( memo ()()(), 321 );
        t.is ( calls, 1 );

        o ( [] );

        t.is ( calls, 1 );
        t.is ( memo ()()(), 321 );
        t.is ( calls, 1 );

      });

      it ( 'resolves the mapped value before returning it', t => {

        const result = $.for ( [1], () => () => () => 123, [], { unkeyed: true } );

        isReadable ( t, result );
        isReadable ( t, result ()[0] );
        isReadable ( t, result ()[0]() );

        t.is ( result ()[0]()(), 123 );

      });

      it ( 'returns a memo to an empty array for an empty array and missing fallback', t => {

        t.deepEqual ( $.for ( [], () => () => 123 )(), [], { unkeyed: true } );

      });

      it ( 'returns a memo to fallback for an empty array and a provided fallback', t => {

        t.is ( $.for ( [], () => () => 123, 123 )(), 123, { unkeyed: true } );

      });

      it ( 'returns a memo to the same array if all values were cached', t => {

        const external = $(0);
        const values = $([1, 2, 3]);

        const valuesWithExternal = () => {
          external ();
          return values ();
        };

        let calls = 0;

        const result = $.for ( valuesWithExternal, value => {
          calls += 1;
          return value ();
        }, [], { unkeyed: true } );

        t.is ( calls, 0 );

        const result1 = result ();

        t.is ( calls, 3 );
        t.deepEqual ( result1, [1, 2, 3] );

        external ( 1 );

        const result2 = result ();

        t.is ( calls, 3 );
        t.deepEqual ( result2, [1, 2, 3] );
        t.is ( result1, result2 );

        values ([ 3, 2, 1 ]);

        const result3 = result ();

        t.is ( calls, 3 );
        t.deepEqual ( result3, [3, 2, 1] );
        t.not ( result1, result3 );

        values ([ 3, 2 ]);

        const result4 = result ();

        t.is ( calls, 3 );
        t.deepEqual ( result4, [3, 2] );

        external ( 2 );

        const result5 = result ();

        t.is ( calls, 3 );
        t.deepEqual ( result5, [3, 2] );
        t.is ( result4, result5 );

      });

      //TODO: add a test for suspending pooled results

      it ( 'supports pooling', t => {

        const array = $([1, 2, 3]);
        const args = [];

        const count = $(0);
        let calls = 0;

        const memo = $.for ( array, value => {
          args.push ( value () );
          $.effect ( () => {
            calls += 1;
            count ();
          }, { sync: true } );
          return value;
        }, [], { unkeyed: true, pooled: true } );

        t.deepEqual ( memo ().map ( call ), [1, 2, 3] );
        t.deepEqual ( args, [1, 2, 3] );

        t.is ( calls, 3 );
        count ( prev => prev + 1 );
        t.is ( calls, 6 );

        array ([]);

        t.deepEqual ( memo ().map ( call ), [] );
        t.deepEqual ( args, [1, 2, 3] );

        t.is ( calls, 6 );
        count ( prev => prev + 1 );
        t.is ( calls, 6 );

        array ([ 1, 2, 3 ]);

        t.deepEqual ( memo ().map ( call ), [1, 2, 3] );
        t.deepEqual ( args, [1, 2, 3] );

        t.is ( calls, 9 );
        count ( prev => prev + 1 );
        t.is ( calls, 12 );

      });

      it ( 'works with an undefined array', t => {

        const memo = $.for ( undefined, t.fail, [], { unkeyed: true } );

        t.deepEqual ( memo ().map ( call ), [] );

      });

      it ( 'works with an array of non-unique values', t => {

        const array = $([ 1, 1, 2 ]);
        const args = [];

        const memo = $.for ( array, value => {
          const memo = $.memo ( () => {
            args.push ( value () );
            return value ();
          });
          return memo;
        }, [], { unkeyed: true } );

        t.deepEqual ( memo ().map ( call ), [1, 1, 2] );
        t.deepEqual ( args, [1, 1, 2] );

        array ([ 2, 2, 1 ]);

        t.deepEqual ( memo ().map ( call ), [2, 2, 1] );
        t.deepEqual ( args, [1, 1, 2, 2] );

      });

    });

  });

  describe ( 'get', it => {

    it ( 'creates a dependency in a memo', t => {

      const o = $(1);

      let calls = 0;

      const memo = $.memo ( () => {
        calls += 1;
        return $.get ( o );
      });

      t.is ( calls, 0 );
      t.is ( memo (), 1 );
      t.is ( calls, 1 );

      o ( 2 );

      t.is ( calls, 1 );
      t.is ( memo (), 2 );
      t.is ( calls, 2 );

      o ( 3 );

      t.is ( calls, 2 );
      t.is ( memo (), 3 );
      t.is ( calls, 3 );

    });

    it ( 'creates a dependency in an effect', async t => {

      const o = $(1);

      let calls = 0;

      $.effect ( () => {
        calls += 1;
        $.get ( o );
      });

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 1 );

      o ( 2 );

      t.is ( calls, 1 );
      await tick ();
      t.is ( calls, 2 );

      o ( 3 );

      t.is ( calls, 2 );
      await tick ();
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

      const memo = $.if ( condition, valueTrue, valueFalse );

      condition ( 2 );

      t.is ( memo ()(), undefined );

      condition ( 3 );

      t.is ( memo ()(), undefined );

      t.is ( sequence, 't' );

      condition ( 0 );

      t.is ( memo ()(), undefined );

      condition ( false );

      t.is ( memo ()(), undefined );

      t.is ( sequence, 'tf' );

      condition ( 4 );

      t.is ( memo ()(), undefined );

      condition ( 5 );

      t.is ( memo ()(), undefined );

      t.is ( sequence, 'tft' );

    });

    it ( 'resolves the fallback value before returning it', t => {

      const result = $.if ( false, 123, () => () => 123 );

      isReadable ( t, result );
      isReadable ( t, result () );
      isReadable ( t, result ()() );

      t.is ( result ()()(), 123 );

    });

    it ( 'resolves the fallback once value before returning it, even if needed multiple times in a sequence', t => {

      const o = $(0);

      let calls = 0;

      const memo = $.if ( o, () => () => 123, () => () => {
        calls += 1;
        return 321;
      });

      t.is ( calls, 0 );

      t.is ( memo ()()(), 321 );

      t.is ( calls, 1 );

      o ( false );

      t.is ( memo ()()(), 321 );

      t.is ( calls, 1 );

      o ( NaN );

      t.is ( memo ()()(), 321 );

      t.is ( calls, 1 );

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

  describe ( 'isBatching', it => {

    it ( 'checks if automatic batching is active, for async effects', async t => {

      t.false ( $.isBatching () );

      $.effect ( () => {

        t.true ( $.isBatching () );

      });

      t.true ( $.isBatching () );

      await tick ();

      t.false ( $.isBatching () );

    });

    it ( 'checks if automatic batching is active, for sync effects', async t => {

      t.false ( $.isBatching () );

      $.effect ( () => {

        // t.true ( $.isBatching () ); //FIXME: this should probably be "true" ideally

      }, { sync: true } );

      t.false ( $.isBatching () );

    });

    it ( 'checks if manual batching is active', async t => {

      t.false ( $.isBatching () );

      await $.batch ( async () => {
        t.true ( $.isBatching () );
        await delay ( 50 );
        t.true ( $.isBatching () );
        await $.batch ( async () => {
          t.true ( $.isBatching () );
          await $.batch ( () => {
            t.true ( $.isBatching () );
          });
          t.true ( $.isBatching () );
        });
        t.true ( $.isBatching () );
        await delay ( 50 );
        t.true ( $.isBatching () );
      });

      t.false ( $.isBatching () );

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

    it ( 'can return frozen observables, statically', t => {

      const memo = $.memo ( () => 123 );

      isReadable ( t, memo );

      memo ();

      isFrozen ( t, memo );

    });

    it ( 'can return frozen observables, dynamically', t => {

      const o = $(1);
      const memo = $.memo ( () => $.untrack ( o ) ? o () : 123 );

      isReadable ( t, memo );

      memo ();

      isReadable ( t, memo );

      o ( 0 );
      memo ();

      isFrozen ( t, memo );

    });

    it ( 'bypasses the comparator function on first run', t => {

      const o1 = $.memo ( () => 123, { equals: () => true } );

      t.is ( o1 (), 123 );

      const o2 = $.memo ( () => undefined, { equals: () => true } );

      t.is ( o2 (), undefined );

    });

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

    it ( 'cleans up dependencies properly when causing itself to re-execute, scenario 1', t => {

      const a = $(0);
      const b = $(0);

      let calls = 0;

      const memo = $.memo ( () => {

        calls += 1;

        if ( !$.untrack ( a ) ) a ( a () + 1 );

        b ();

      });

      t.is ( calls, 0 );
      t.is ( memo (), undefined );
      t.is ( calls, 2 );

      a ( 2 );

      t.is ( calls, 2 );
      t.is ( memo (), undefined );
      t.is ( calls, 2 );

      b ( 1 );

      t.is ( calls, 2 );
      t.is ( memo (), undefined );
      t.is ( calls, 3 );

    });

    it ( 'cleans up dependencies properly when causing itself to re-execute, scenario 2', t => {

      const a = $(0);
      const b = $(0);

      let calls = 0;

      const memo = $.memo ( () => {

        calls += 1;

        a ();
        b ( Math.random () );
        b ();

      });

      t.is ( calls, 0 );
      t.is ( memo (), undefined );
      t.is ( calls, 1 );

      a ( 2 );

      t.is ( calls, 1 );
      t.is ( memo (), undefined );
      t.is ( calls, 2 );

    });

    it ( 'cleans up dependencies properly when causing itself to re-execute, scenario 3', t => {

      const branch = $(false);
      const o = new Array ( 100 ).fill ( 0 ).map ( () => $(0) );
      const oo = [...o, ...o];

      let calls = 0;

      const memo = $.memo ( () => {

        calls += 1;

        oo.forEach ( o => o () );

        if ( $.untrack ( branch ) ) return;

        oo.forEach ( o => o () );

      });

      t.is ( calls, 0 );
      t.is ( memo (), undefined );
      t.is ( calls, 1 );

      branch ( true );
      o[0]( 1 );

      t.is ( calls, 1 );
      t.is ( memo (), undefined );
      t.is ( calls, 2 );

      o[0]( 2 );

      t.is ( calls, 2 );
      t.is ( memo (), undefined );
      t.is ( calls, 3 );

    });

    it ( 'cleans up inner memos', t => {

      const o = $(0);
      const active = $(true);

      let calls = 0;

      const memo1 = $.memo ( () => {

        if ( !active () ) return;

        const memo2 = $.memo ( () => {

          calls += 1;

          o ();

        });

        $.untrack ( memo2 );

      });

      t.is ( calls, 0 );
      t.is ( memo1 (), undefined );
      t.is ( calls, 1 );

      active ( false );
      o ( 1 );

      t.is ( calls, 1 );
      t.is ( memo1 (), undefined );
      t.is ( calls, 1 );

    });

    it ( 'does not throw when disposing of itself', t => {

      t.notThrows ( () => {

        $.root ( dispose => {

          const memo = $.memo ( () => {

            dispose ();

            return 1;

          });

          memo ();

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

    it ( 'supports any number of dependencies', t => {

      for ( const nr of [1, 2, 3, 4, 5] ) {

        const oo = new Array ( nr ).fill ( 0 ).map ( () => $(0) );

        let calls = 0;

        const memo = $.memo ( () => {
          calls += 1;
          oo.map ( call );
        });

        t.is ( calls, 0 );
        t.is ( memo (), undefined );
        t.is ( calls, 1 );

        for ( const [i, o] of Array.from ( oo.entries () ) ) {

          o ( prev => prev + 1 );

          t.is ( calls, i + 1 );
          t.is ( memo (), undefined );
          t.is ( calls, i + 2 );

        }

      }

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

      a ( 10 );

      t.is ( c (), 2 );

      b ( 20 );

      t.is ( c (), 20 );

      bool ( true );

      t.is ( c (), 10 );

    });

    it ( 'supports manually registering a function to be called when the parent computation updates', t => {

      const o = $(0);

      let sequence = '';

      const memo = $.memo ( () => {

        o ();

        $.cleanup ( () => {
          sequence += 'a';
        });

        $.cleanup ( () => {
          sequence += 'b';
        });

      });

      t.is ( memo (), undefined );
      t.is ( sequence, '' );

      o ( 1 );

      t.is ( memo (), undefined );
      t.is ( sequence, 'ba' );

      o ( 2 );

      t.is ( memo (), undefined );
      t.is ( sequence, 'baba' );

      o ( 3 );

      t.is ( memo (), undefined );
      t.is ( sequence, 'bababa' );

    });

    it ( 'supports refreshing itself even if its last dependency did not actually change', t => {

      const o = $(0);
      const memo = $.memo ( () => Math.min ( 0, o () ) );

      let calls = 0;

      const memo2 = $.memo ( () => {
        o ();
        memo ();
        calls += 1;
      });

      t.is ( calls, 0 );
      t.is ( memo2 (), undefined );
      t.is ( calls, 1 );

      o ( 1 );

      t.is ( calls, 1 );
      t.is ( memo2 (), undefined );
      t.is ( calls, 2 );

    });

    it ( 'supports synchronous memos', t => {

      const o = $(0);

      let calls = 0;

      $.memo ( () => {
        calls += 1;
        o ();
      }, { sync: true } );

      t.is ( calls, 1 );

      o ( 1 );

      t.is ( calls, 2 );

    });

    it ( 'supports checking dependecies for updates on synchronous memos also', t => {

      const o = $(0);
      const memo = $.memo ( o, { equals: () => true } );

      let calls = 0;

      $.memo ( () => {

        calls += 1;

        memo ();

      }, { sync: true } );

      t.is ( calls, 1 );

      o ( 1 );

      t.is ( calls, 1 );

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

      const memo1 = $.memo ( () => {
        calls += 1;
        return a ();
      });

      t.is ( calls, 0 );
      t.is ( memo1 (), 0 );
      t.is ( calls, 1 );

      const memo2 = $.memo ( () => {
        a ( 1 );
        b ();
        a ( 0 );
      });

      t.is ( calls, 1 );
      t.is ( memo1 (), 0 );
      t.is ( calls, 1 );

      memo2 ();

      t.is ( calls, 1 );
      t.is ( memo1 (), 0 );
      t.is ( calls, 2 );

      b ( 1 );
      memo2 ();

      t.is ( calls, 2 );
      t.is ( memo1 (), 0 );
      t.is ( calls, 3 );

      a ( 1 );
      memo2 ();

      t.is ( calls, 3 );
      t.is ( memo1 (), 1 );
      t.is ( calls, 4 );

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

  describe ( 'owner', it => {

    it ( 'detects the super root', t => {

      const owner = $.owner ();

      t.true ( owner.isSuperRoot );
      t.false ( owner.isRoot );
      t.false ( owner.isSuspense );
      t.false ( owner.isComputation );

    });

    it ( 'detects a root', t => {

      $.root ( () => {

        const owner = $.owner ();

        t.false ( owner.isSuperRoot );
        t.true ( owner.isRoot );
        t.false ( owner.isSuspense );
        t.false ( owner.isComputation );

      });

    });

    it ( 'detects an effect', async t => {

      $.effect ( () => {

        const owner = $.owner ();

        t.false ( owner.isSuperRoot );
        t.false ( owner.isRoot );
        t.false ( owner.isSuspense );
        t.true ( owner.isComputation );

      });

      await tick ();

    });

    it ( 'detects a memo', t => {

      const memo = $.memo ( () => {

        const owner = $.owner ();

        t.false ( owner.isSuperRoot );
        t.false ( owner.isRoot );
        t.false ( owner.isSuspense );
        t.true ( owner.isComputation );

      });

      memo ();

    });

    it ( 'detects a suspense', t => {

      $.suspense ( false, () => {

        const owner = $.owner ();

        t.false ( owner.isSuperRoot );
        t.false ( owner.isRoot );
        t.true ( owner.isSuspense );
        t.false ( owner.isComputation );

      });

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
          const memo = $.memo ( () => {
            calls += 1;
            return o () ** 2;
          });
          $.effect ( () => {
            memo ();
          }, { sync: true } );
        };

        const memo = $.resolve ( fn );

        memo ();

        return dispose;

      });

      t.is ( calls, 1 );

      o ( 3 );

      t.is ( calls, 2 );

      dispose ();

      o ( 4 );

      t.is ( calls, 2 );

    });

    it ( 'properly disposes of inner effects', async t => {

      const o = $(2);

      let calls = 0;

      const dispose = $.root ( dispose => {

        const fn = () => {
          $.effect ( () => {
            calls += 1;
            o () ** 2;
          });
        };

        const memo = $.resolve ( fn );

        memo ();

        return dispose;

      });

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 1 );

      o ( 3 );

      t.is ( calls, 1 );
      await tick ();
      t.is ( calls, 2 );

      dispose ();

      o ( 4 );

      t.is ( calls, 2 );
      await tick ();
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

  describe ( 'root', it => {

    it ( 'allows child computations to escape their parents', t => {

      $.root ( () => {

        const outer = $(0);
        const inner = $(0);

        let memo1;
        let memo2 = [];

        const pull = () => {
          memo1 ();
          memo2.forEach ( memo => memo () );
        };

        let outerCalls = 0;
        let innerCalls = 0;

        memo1 = $.memo ( () => {
          outer ();
          outerCalls += 1;
          $.root ( () => {
            memo2.push ( $.memo ( () => {
              inner ();
              innerCalls += 1;
            }));
          });
        });

        t.is ( outerCalls, 0 );
        t.is ( innerCalls, 0 );
        pull ();
        t.is ( outerCalls, 1 );
        t.is ( innerCalls, 1 );

        outer ( 1 );
        outer ( 2 );

        t.is ( outerCalls, 1 );
        t.is ( innerCalls, 1 );
        pull ();
        t.is ( outerCalls, 2 );
        t.is ( innerCalls, 2 );

        inner ( 1 );

        t.is ( outerCalls, 2 );
        t.is ( innerCalls, 2 );
        pull ();
        t.is ( outerCalls, 2 );
        t.is ( innerCalls, 4 );

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

        t.is ( calls, 0 );
        t.is ( b (), 0 );
        t.is ( calls, 1 );

        a ( 1 );

        t.is ( calls, 1 );
        t.is ( b (), 1 );
        t.is ( calls, 2 );

        dispose ();

        a ( 2 );

        t.is ( calls, 2 );
        t.is ( b (), 1 );
        t.is ( calls, 2 );

      });

    });

    it ( 'can be disposed from a child computation', t => {

      $.root ( dispose => {

        let calls = 0;

        const a = $(0);

        const memo = $.memo ( () => {
          calls += 1;
          if ( a () ) dispose ();
          return a ();
        });

        t.is ( calls, 0 );
        t.is ( memo (), 0 );
        t.is ( calls, 1 );

        a ( 1 );

        t.is ( calls, 1 );
        t.is ( memo (), 1 );
        t.is ( calls, 2 );

        a ( 2 );

        t.is ( calls, 2 );
        t.is ( memo (), 1 );
        t.is ( calls, 2 );

      });

    });

    it ( 'can be disposed from a child computation of a child computation', t => {

      $.root ( dispose => {

        let calls = 0;

        const a = $(0);

        const memo1 = $.memo ( () => {
          calls += 1;
          a ();
          const memo2 = $.memo ( () => {
            if ( a () ) dispose ();
          });
          $.untrack ( memo2 );
        });

        t.is ( calls, 0 );
        t.is ( memo1 (), undefined );
        t.is ( calls, 1 );

        a ( 1 );

        t.is ( calls, 1 );
        t.is ( memo1 (), undefined );
        t.is ( calls, 2 );

        a ( 2 );

        t.is ( calls, 2 );
        t.is ( memo1 (), undefined );
        t.is ( calls, 2 );

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

    it ( 'returns an observable', async t => {

      const source = $(0);
      const selector = $.selector ( source );
      const selected = selector ( 1 );

      isReadable ( t, selected );

      await tick ();

      t.false ( selected () );

      source ( 1 );

      await tick ();

      t.true ( selected () );

    });

    it ( 'efficiently tells when the provided item is the selected one', async t => {

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

      await tick ();

      t.is ( sequence, '12345' );

      select ( 1 );

      await tick ();

      t.is ( sequence, '1234511' );

      select ( 2 );

      await tick ();

      t.is ( sequence, '1234511122' );

      select ( -1 );

      await tick ();

      t.is ( sequence, '12345111222' );

    });

    it ( 'memoizes the source function', async t => {

      const values = [0, 1, 2, 3, 4];

      const selectedFactor1 = $(0);
      const selectedFactor2 = $(1);
      const selected = () => selectedFactor1 () * selectedFactor2 ();
      const selector = $.selector ( selected );

      let sequence = '';

      values.forEach ( value => {

        $.effect ( () => {

          sequence += value;

          if ( !selector ( value )() ) return;

          sequence += value;

        });

      });

      await tick ();

      t.is ( sequence, '001234' );

      selectedFactor2 ( 2 );

      await tick ();

      t.is ( sequence, '001234' );

    });

    it ( 'survives checking a value inside a discarded root', async t => {

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

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 1 );

      selected ( 1 );

      t.is ( calls, 1 );
      await tick ();
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

      describe ( 'base', () => {

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

          const memo = $.memo ( () => {
            calls += 1;
            return o.value;
          });

          t.is ( calls, 0 );
          t.is ( memo (), 1 );
          t.is ( calls, 1 );

          o.value = 2;

          t.is ( calls, 1 );
          t.is ( memo (), 2 );
          t.is ( calls, 2 );

          o.value = 3;

          t.is ( calls, 2 );
          t.is ( memo (), 3 );
          t.is ( calls, 3 );

        });

        it ( 'creates a dependency in an effect when getting a shallow property', async t => {

          const o = $.store ({ value: 1 });

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            o.value;
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );

          o.value = 2;

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 2 );

          o.value = 3;

          t.is ( calls, 2 );
          await tick ();
          t.is ( calls, 3 );

        });

        it ( 'creates a dependency in a memo when getting a deep property', t => {

          const o = $.store ({ deep: { value: 1 } });

          let calls = 0;

          const memo = $.memo ( () => {
            calls += 1;
            return o.deep.value;
          });

          t.is ( calls, 0 );
          t.is ( memo (), 1 );
          t.is ( calls, 1 );

          o.deep.value = 2;

          t.is ( calls, 1 );
          t.is ( memo (), 2 );
          t.is ( calls, 2 );

          o.deep.value = 3;

          t.is ( calls, 2 );
          t.is ( memo (), 3 );
          t.is ( calls, 3 );

        });

        it ( 'creates a dependency in an effect when getting a deep property', async t => {

          const o = $.store ({ deep: { value: 1 } });

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            o.deep.value;
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );

          o.deep.value = 2;

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 2 );

          o.deep.value = 3;

          t.is ( calls, 2 );
          await tick ();
          t.is ( calls, 3 );

        });

        it ( 'creates a single dependency in an memo even if getting a shallow property multiple times', t => {

          const o = $.store ({ value: 1 });

          let calls = 0;

          const memo = $.memo ( () => {
            calls += 1;
            o.value;
            o.value;
            o.value;
            return o.value;
          });

          t.is ( calls, 0 );
          t.is ( memo (), 1 );
          t.is ( calls, 1 );

          o.value = 2;

          t.is ( calls, 1 );
          t.is ( memo (), 2 );
          t.is ( calls, 2 );

          o.value = 3;

          t.is ( calls, 2 );
          t.is ( memo (), 3 );
          t.is ( calls, 3 );

        });

        it ( 'creates a single dependency in an effect even if getting a shallow property multiple times', async t => {

          const o = $.store ({ value: 1 });

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            o.value;
            o.value;
            o.value;
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );

          o.value = 2;

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 2 );

          o.value = 3;

          t.is ( calls, 2 );
          await tick ();
          t.is ( calls, 3 );

        });

        it ( 'creates a single dependency in a memo even if getting a deep property multiple times', async t => {

          const o = $.store ({ deep: { value: 1 } });

          let calls = 0;

          const memo = $.memo ( () => {
            calls += 1;
            o.deep.value;
            o.deep.value;
            o.deep.value;
            return o.deep.value;
          });

          t.is ( calls, 0 );
          t.is ( memo (), 1 );
          t.is ( calls, 1 );

          o.deep.value = 2;

          t.is ( calls, 1 );
          t.is ( memo (), 2 );
          t.is ( calls, 2 );

          o.deep.value = 3;

          t.is ( calls, 2 );
          t.is ( memo (), 3 );
          t.is ( calls, 3 );

        });

        it ( 'creates a single dependency in an effect even if getting a deep property multiple times', async t => {

          const o = $.store ({ deep: { value: 1 } });

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            o.deep.value;
            o.deep.value;
            o.deep.value;
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );

          o.deep.value = 2;

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 2 );

          o.deep.value = 3;

          t.is ( calls, 2 );
          await tick ();
          t.is ( calls, 3 );

        });

        it ( 'does not access a getter when setting without a setter', t => {

          t.plan ( 2 );

          const o = $.store ({
            get value () {
              calls += 1;
            }
          });

          let calls = 0;

          try {
            o.value = 0;
          } catch ( error ) {
            t.is ( error instanceof Error, true );
          }

          t.is ( calls, 0 );

        });

        it ( 'does not access a getter when performing an in property check', t => {

          const o = $.store ({
            get value () {
              calls += 1;
            }
          });

          let calls = 0;

          t.is ( 'value' in o, true );
          t.is ( calls, 0 );

        });

        it ( 'does not create a dependency in a memo when creating', t => {

          let o;
          let calls = 0;

          const memo = $.memo ( () => {
            calls += 1;
            o = $.store ({ value: 1 });
          });

          t.is ( calls, 0 );
          t.is ( memo (), undefined );
          t.is ( calls, 1 );

          o.value = 2;

          t.is ( calls, 1 );
          t.is ( memo (), undefined );
          t.is ( calls, 1 );

        });

        it ( 'does not create a dependency in an effect when creating', async t => {

          let o;
          let calls = 0;

          $.effect ( () => {
            calls += 1;
            o = $.store ({ value: 1 });
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );

          o.value = 2;

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 1 );

        });

        it ( 'does not create a dependency in a memo when setting a shallow property', t => {

          let o = $.store ({ value: 0 });
          let calls = 0;

          const memo = $.memo ( () => {
            calls += 1;
            o.value = 1;
          });

          t.is ( calls, 0 );
          t.is ( memo (), undefined );
          t.is ( calls, 1 );

          o.value = 2;

          t.is ( calls, 1 );
          t.is ( memo (), undefined );
          t.is ( calls, 1 );

        });

        it ( 'does not create a dependency in an effect when setting a shallow property', async t => {

          let o = $.store ({ value: 0 });
          let calls = 0;

          $.effect ( () => {
            calls += 1;
            o.value = 1;
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );

          o.value = 2;

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 1 );

        });

        it ( 'does not create a dependency in a memo when getting a parent property of the one being updated', t => {

          const o = $.store ({ deep: { value: 1 } });

          let calls = 0;

          const memo = $.memo ( () => {
            calls += 1;
            o.deep;
          });

          t.is ( calls, 0 );
          t.is ( memo (), undefined );
          t.is ( calls, 1 );

          o.deep.value = 2;

          t.is ( calls, 1 );
          t.is ( memo (), undefined );
          t.is ( calls, 1 );

          o.deep.value = 3;

          t.is ( calls, 1 );
          t.is ( memo (), undefined );
          t.is ( calls, 1 );

        });

        it ( 'does not create a dependency in an effect when getting a parent property of the one being updated', async t => {

          const o = $.store ({ deep: { value: 1 } });

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            o.deep;
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );

          o.deep.value = 2;

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 1 );

          o.deep.value = 3;

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 1 );

        });

        it ( 'does create a dependency (on the parent) in a memo when setting a deep property', t => { //FIXME: This can't quite be fixed, it's a quirk of how mutable stores work

          const o = $.store ({ deep: { value: 1 } });

          let calls = 0;

          const memo = $.memo ( () => {
            calls += 1;
            o.deep.value = 2;
          });

          t.is ( calls, 0 );
          t.is ( memo (), undefined );
          t.is ( calls, 1 );

          o.deep.value = 3;

          t.is ( calls, 1 );
          t.is ( memo (), undefined );
          t.is ( calls, 1 );

          o.deep = {};

          t.is ( calls, 1 );
          t.is ( memo (), undefined );
          t.is ( calls, 2 );

        });

        it ( 'does create a dependency (on the parent) in an effect when setting a deep property', async t => { //FIXME: This can't quite be fixed, it's a quirk of how mutable stores work

          const o = $.store ({ deep: { value: 1 } });

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            o.deep.value = 2;
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );

          o.deep.value = 3;

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 1 );

          o.deep = {};

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 2 );

        });

        it ( 'preserves references to existing stores, without re-proxying them', t => {

          const obj = { foo: 123 };
          const o1 = $.store ({ value: obj });
          const o2 = $.store ({ value: obj });
          const o3 = $.store ({ value: o1 });
          const o4 = $.store ({ value: o2 });

          t.true ( o1.value === o2.value );
          t.true ( o2.value === o3.value.value );
          t.true ( o3.value === o1 );
          t.true ( o3.value.value === o4.value.value );

        });

        it.skip ( 'preserves references to existing stores, without triggering dependents', async t => {

          const inner = $.store ({ foo: 1 });
          const outer = $.store ({ value: inner });

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            outer.value;
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );

          outer.value = inner;

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 1 );

          outer.value = outer.value;

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 1 );

          outer.value = $.store.unwrap ( inner );

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 1 );

        });

        it ( 'properly forgets about getters and setters when deleting them', t => {

          let calls = 0;

          const o = $.store ({
            get b () {
              calls += 1;
            },
            set b ( value ) {
              calls += 1;
            }
          });

          delete o.b;

          o.b;
          o.b = 3;

          t.is ( calls, 0 );

        });

        it ( 'respects the get proxy trap invariant about non-writable non-configurable properties', t => {

          const object = Object.defineProperties ( {}, {
            nonConfigurable: {
              value: {},
              configurable: false,
              writable: true
            },
            nonWritable: {
              value: {},
              configurable: true,
              writable: false
            },
            nonConfigurableNonWritable: {
              value: {},
              configurable: false,
              writable: false
            }
          });

          const o = $.store ( object );

          t.is ( $.isStore ( o.nonConfigurable ), true );
          t.is ( $.isStore ( o.nonWritable ), true );
          t.is ( $.isStore ( o.nonConfigurableNonWritable ), false );

        });

        it ( 'returns a frozen object as is', t => {

          const frozen = Object.freeze ({ user: { name: 'John' } });

          let o = $.store ( frozen );

          t.is ( Object.isFrozen ( o ), true );
          t.is ( $.isStore ( o ), false );

          t.is ( Object.isFrozen ( o.user ), false );
          t.is ( $.isStore ( o.user ), false );

        });

        it ( 'returns a deep frozen object as is', t => {

          const frozen = Object.freeze ({ user: { name: 'John' } });

          let o = $.store ({ deep: frozen });

          t.is ( Object.isFrozen ( o ), false );
          t.is ( $.isStore ( o ), true );

          t.is ( Object.isFrozen ( o.deep ), true );
          t.is ( $.isStore ( o.deep ), false );

        });

        it ( 'returns primitive values as is', t => {

          const o = $.store ( 123 );

          t.is ( o, 123 );

        });

        it ( 'returns unproxied "__proto__", "prototype" and "constructor" properties', t => {

          const a = {};
          const b = {};
          const c = {};
          const sa = $.store ({ prototype: a });
          const sb = $.store ({ '__proto__': b });
          const sc = $.store ({ constructor: c });

          t.false ( $.isStore ( sa.__proto__ ) );
          t.false ( $.isStore ( sb.prototype ) );
          t.false ( $.isStore ( sc.constructor ) );

        });

        it ( 'returns unproxied "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toSource", "toString", "valueOf", properties', async t => {

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

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );

          o.hasOwnProperty = 1;
          o.isPrototypeOf = 1;
          o.propertyIsEnumerable = 1;
          o.toLocaleString = 1;
          o.toSource = 1;
          o.toString = 1;
          o.valueOf = 1;

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 1 );

        });

        it ( 'returns the value being set', t => {

          const o = $.store ({ value: undefined });

          t.is ( o.value = 123, 123 );

        });

        it ( 'supports a custom equality function', t => {

          const equals = ( next, prev ) => ( next % 10 ) === ( prev % 10 );
          const o = $.store ({ value: 0 }, { equals });

          t.is ( o.value, 0 );

          o.value = 10;

          t.is ( o.value, 0 );

          o.value = 11;

          t.is ( o.value, 11 );

        });

        it ( 'supports a false equality function', async t => {

          const o = $.store ({ value: true }, { equals: false });

          let calls = 0;

          $.effect ( () => {

            calls += 1;

            o.value;

          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );

          o.value = true;

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 2 );

        });

        it ( 'supports a custom equality function, when setting property descriptors', t => {

          const equals = ( next, prev ) => ( next % 10 ) === ( prev % 10 );
          const o = $.store ({ value: 0 }, { equals });

          t.is ( o.value, 0 );

          Object.defineProperty ( o, 'value', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: 10
          });

          t.is ( o.value, 0 );

          Object.defineProperty ( o, 'value', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: 11
          });

          t.is ( o.value, 11 );

        });

        it ( 'supports a custom equality function, which is inherited also', t => {

          const equals = ( next, prev ) => ( next % 10 ) === ( prev % 10 );
          const o = $.store ({ nested: { value: 0 } }, { equals });

          t.is ( o.nested.value, 0 );

          o.nested.value = 10;

          t.is ( o.nested.value, 0 );

          o.nested.value = 11;

          t.is ( o.nested.value, 11 );

        });

        it ( 'supports a custom equality function, which cannot be overridden', t => {

          const equals1 = ( next, prev ) => ( next % 10 ) === ( prev % 10 );
          const equals2 = ( next, prev ) => next === 'a';
          const other = $.store ({ value: 0 }, { equals: equals2 });
          const o = $.store ({ value: 0, other }, { equals: equals1 });

          t.is ( o.value, 0 );

          o.value = 10;

          t.is ( o.value, 0 );

          o.value = 11;

          t.is ( o.value, 11 );

          o.value = 'a';

          t.is ( o.value, 'a' );

          // --------

          t.is ( o.other.value, 0 );

          o.other.value = 10;

          t.is ( o.other.value, 10 );

          o.other.value = 11;

          t.is ( o.other.value, 11 );

          o.other.value = 'a';

          t.is ( o.other.value, 11 );

          o.other.value = 'b'

          t.is ( o.other.value, 'b' );

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

        it ( 'supports reacting to deleting a shallow property', async t => {

          const o = $.store ( { value: 123 } );

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            o.value;
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );

          delete o.value;

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 2 );

        });

        it ( 'supports not reacting when deleting a shallow property that was undefined', async t => {

          const o = $.store ( { value: undefined } );

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            o.value;
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );

          delete o.value;

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 1 );

        });

        it ( 'supports reacting to deleting a deep property', async t => {

          const o = $.store ( { deep: { value: 123 } } );

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            o.deep.value;
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );

          delete o.deep.value;

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 2 );

        });

        it ( 'supports not reacting when deleting a deep property that was undefined', async t => {

          const o = $.store ( { deep: { value: undefined } } );

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            o.deep.value;
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );

          delete o.deep.value;

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 1 );

        });

        it ( 'supports not reacting when setting a primitive property to itself', async t => {

          const o = $.store ( { value: 1 } );

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            o.value;
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );

          o.value = 1;

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 1 );

        });

        it ( 'supports not reacting when setting a non-primitive property to itself', async t => {

          const o = $.store ( { deep: { value: 2 } } );

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            o.deep.value;
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );

          o.deep = o.deep;

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 1 );

        });

        it ( 'supports not reacting when setting a non-primitive property to itself, when reading all values', async t => {

          const o = $.store ([ 0 ]);

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            o[SYMBOL_STORE_VALUES];
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );

          o[0] = o[0];

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 1 );

        });

        it ( 'supports not reacting when reading the length on a array, when reading all values, if the length does not actually change', async t => {

          const o = $.store ({ value: [0] });

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            o.value.length;
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );

          o.value.splice ( 0, 1, 1 );

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 1 );

        });

        it ( 'supports not reacting when reading the length on a non-array, when reading all values, if the length does not actually change', async t => { //TODO

          const o = $.store ({ length: 0 });

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            o[SYMBOL_STORE_VALUES];
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );

          o.length = o.length;

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 1 );

        });

        it ( 'supports reacting to own keys', async t => {

          const o = $.store ( { foo: 1, bar: 2, baz: 3 } );

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            Object.keys ( o );
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );

          o.qux = 4;

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 2 );

          o.foo = 2;
          o.bar = 3;
          o.baz = 4;
          o.qux = 5;

          t.is ( calls, 2 );
          await tick ();
          t.is ( calls, 2 );

          delete o.foo;

          t.is ( calls, 2 );
          await tick ();
          t.is ( calls, 3 );

        });

        it ( 'supports reacting to properties read by a getter, for plain objects', async t => {

          const o = $.store ( { foo: 1, bar: 2, get fn () { return this.foo + this.bar; } } );

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            o.fn;
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );

          o.foo = 10;

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 2 );
          t.is ( o.fn, 12 );

          o.bar = 20;

          t.is ( calls, 2 );
          await tick ();
          t.is ( calls, 3 );
          t.is ( o.fn, 30 );

        });

        it.skip ( 'supports reacting to properties read by a getter, for a class', async t => {

          class Class  {
            foo = 1;
            bar = 2;
            get fn () {
              return this.foo + this.bar;
            }
          }

          const o = $.store ( new Class () );

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            o.fn;
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );

          o.foo = 10;

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 2 );
          t.is ( o.fn, 12 );

          o.bar = 20;

          t.is ( calls, 2 );
          await tick ();
          t.is ( calls, 3 );
          t.is ( o.fn, 30 );

        });

        it ( 'supports reacting to properties read by a regular function', async t => {

          const o = $.store ( { foo: 1, bar: 2, fn () { return this.foo + this.bar; } } );

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            o.fn ();
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );

          o.foo = 10;

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 2 );
          t.is ( o.fn (), 12 );

          o.bar = 20;

          t.is ( calls, 2 );
          await tick ();
          t.is ( calls, 3 );
          t.is ( o.fn (), 30 );

        });

        it ( 'supports reacting to properties read by a regular function, called via the call method', async t => {

          const o = $.store ( { foo: 1, bar: 2, fn () { return this.foo + this.bar; } } );

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            o.fn.call ( o );
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );

          o.foo = 10;

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 2 );
          t.is ( o.fn.call ( o ), 12 );

          o.bar = 20;

          t.is ( calls, 2 );
          await tick ();
          t.is ( calls, 3 );
          t.is ( o.fn.call ( o ), 30 );

        });

        it ( 'supports reacting to properties read by a regular function, called via the apply method', async t => {

          const o = $.store ( { foo: 1, bar: 2, fn () { return this.foo + this.bar; } } );

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            o.fn.apply ( o );
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );

          o.foo = 10;

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 2 );
          t.is ( o.fn.apply ( o ), 12 );

          o.bar = 20;

          t.is ( calls, 2 );
          await tick ();
          t.is ( calls, 3 );
          t.is ( o.fn.apply ( o ), 30 );

        });

        it ( 'supports reacting to changes in the length property of an array, when indirectly deleting values', async t => {

          const o = $.store ([ 1, 2, 3 ]);

          let calls = '';

          $.effect ( () => {
            o[0];
            calls += '0';
          });

          $.effect ( () => {
            o[1];
            calls += '1';
          });

          $.effect ( () => {
            o[2];
            calls += '2';
          });

          t.is ( calls, '' );
          await tick ();
          t.is ( calls, '012' );
          t.is ( o[0], 1 );
          t.is ( o[1], 2 );
          t.is ( o[2], 3 );
          t.is ( o.length, 3 );

          o.length = 1;

          await tick ();
          t.is ( calls, '01212' );
          t.is ( o[0], 1 );
          t.is ( o[1], undefined );
          t.is ( o[2], undefined );
          t.is ( o.length, 1 );

        });

        it ( 'supports reacting to changes in the length property of an array, when indirectly deleting the presence of properties', async t => {

          const o = $.store ([ 1, 2, 3 ]);

          let calls = '';

          $.effect ( () => {
            '0' in o;
            calls += '0';
          });

          $.effect ( () => {
            '1' in o;
            calls += '1';
          });

          $.effect ( () => {
            '2' in o;
            calls += '2';
          });

          t.is ( calls, '' );
          await tick ();
          t.is ( calls, '012' );
          t.is ( 0 in o, true );
          t.is ( 1 in o, true );
          t.is ( 2 in o, true );
          t.is ( o.length, 3 );

          o.length = 1;

          await tick ();
          t.is ( calls, '01212' );
          t.is ( 0 in o, true );
          t.is ( 1 in o, false );
          t.is ( 2 in o, false );
          t.is ( o.length, 1 );

        });

        it ( 'supports reacting to changes in the length property of an array, when indirectly deleting some keys', async t => {

          const o = $.store ([ 1, 2, 3 ]);

          let calls = 0;

          $.effect ( () => {
            Object.keys ( o );
            calls += 1;
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );

          o.length = 1;

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 2 );

        });

        it ( 'supports reacting to changes in the length property of an array, when it happens indiretly by inserting a new item', async t => {

          const o = $.store (['foo']);

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            o.join ( ' ' );
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );

          o[1] = 'bar';

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 2 );

          o[3] = 'baz';

          t.is ( calls, 2 );
          await tick ();
          t.is ( calls, 3 );

        });

        it ( 'supports batching implicitly', async t => {

          const o = $.store ( { foo: 1, bar: 2 } );

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            o.foo;
            o.bar;
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );

          o.foo = 10;
          o.bar = 20;

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 2 );
          t.is ( o.foo, 10 );
          t.is ( o.bar, 20 );

        });

        it ( 'supports batching setters automatically', async t => {

          const o = $.store ( { foo: 1, bar: 2, set fn ( increment ) { this.foo += increment; this.bar += increment; } } );

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            o.foo;
            o.bar;
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );

          o.fn = 1;

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 2 );
          t.is ( o.foo, 2 );
          t.is ( o.bar, 3 );

        });

        it ( 'supports batching deletions automatically', async t => {

          const o = $.store ( { foo: 1, bar: 2 } );

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            o.foo;
            if ( 'foo' in o ) {}
            Object.keys ( o );
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );

          delete o.foo;

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 2 );

        });

        it ( 'supports batching additions automatically', async t => {

          const o = $.store ( { bar: 2 } );

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            o.foo;
            if ( 'foo' in o ) {}
            Object.keys ( o );
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );

          o.foo = 1;

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 2 );

        });

        it ( 'supports reacting to changes in deep arrays', async t => {

          const o = $.store ( { value: [1, 2] } );

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            o.value.length;
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );

          o.value.pop ();

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 2 );

          o.value.pop ();

          t.is ( calls, 2 );
          await tick ();
          t.is ( calls, 3 );

          o.value.push ( 1 );

          t.is ( calls, 3 );
          await tick ();
          t.is ( calls, 4 );

        });

        it ( 'supports reacting to changes in top-level arrays', async t => {

          const o = $.store ( [1, 2] );

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            o.length;
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );

          o.pop ();

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 2 );

          o.pop ();

          t.is ( calls, 2 );
          await tick ();
          t.is ( calls, 3 );

          o.push ( 1 );

          t.is ( calls, 3 );
          await tick ();
          t.is ( calls, 4 );

        });

        it ( 'supports reacting to changes at a specific index in deep arrays', async t => {

          const o = $.store ( { value: [1, 2] } );

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            o.value[0];
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );

          o.value.pop ();

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 1 );

          o.value.push ( 10 );

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 1 );

          o.value[0] = 123;

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 2 );

          o.value.unshift ( 1 );

          t.is ( calls, 2 );
          await tick ();
          t.is ( calls, 3 );

          o.value.unshift ( 1 );

          t.is ( calls, 3 );
          await tick ();
          t.is ( calls, 3 );

          o.value.unshift ( 2 );

          t.is ( calls, 3 );
          await tick ();
          t.is ( calls, 4 );

        });

        it ( 'supports reacting to changes at a specific index in top-level arrays', async t => {

          const o = $.store ( [1, 2] );

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            o[0];
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );

          o.pop ();

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 1 );

          o.push ( 10 );

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 1 );

          o[0] = 123;

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 2 );

          o.unshift ( 1 );

          t.is ( calls, 2 );
          await tick ();
          t.is ( calls, 3 );

          o.unshift ( 1 );

          t.is ( calls, 3 );
          await tick ();
          t.is ( calls, 3 );

          o.unshift ( 2 );

          t.is ( calls, 3 );
          await tick ();
          t.is ( calls, 4 );

        });

        it ( 'supports reacting to changes on custom classes', async t => {

          class Foo {
            constructor () {
              this.foo = 0;
              return $.store ( this );
            }
          }

          class Bar extends Foo {
            constructor () {
              super ();
              this.bar = 0;
              return $.store ( this );
            }
          }

          const foo = new Foo ();
          const bar = new Bar ();

          let calls = '';

          $.effect ( () => {
            foo.foo;
            calls += 'f';
          });

          $.effect ( () => {
            bar.bar;
            calls += 'b';
          });

          t.is ( calls, '' );
          await tick ();
          t.is ( calls, 'fb' );

          foo.foo += 1;

          t.is ( calls, 'fb' );
          await tick ();
          t.is ( calls, 'fbf' );

          bar.bar += 1;

          t.is ( calls, 'fbf' );
          await tick ();
          t.is ( calls, 'fbfb' );

        });

        it ( 'supports batching array methods automatically', async t => {

          const o = $.store ( { value: [1, 2, 3] } );

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            o.value.forEach ( () => {} );
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );

          o.value.forEach ( ( value, index ) => {
            o.value[index] = value * 2;
          });

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 2 );

        });

        it ( 'supports reacting to in property checks, deleting', async t => {

          const o = $.store ( { value: undefined } );

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            if ( 'value' in o ) {}
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );

          delete o.value;

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 2 );

          delete o.value;

          t.is ( calls, 2 );
          await tick ();
          t.is ( calls, 2 );

        });

        it ( 'supports reacting to in property checks, adding', async t => {

          const o = $.store ( {} );

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            if ( 'value' in o ) {}
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );

          o.value = undefined;

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 2 );

          o.value = undefined;

          t.is ( calls, 2 );
          await tick ();
          t.is ( calls, 2 );

        });

        it.skip ( 'supports reacting to hasOwnProperty property checks, deleting', async t => { // This is problematic to support, too many built-ins read descriptors, with no intention of tracking

          const o = $.store ( { value: undefined } );

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            if ( o.hasOwnProperty ( 'value' ) ) {}
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );

          delete o.value;

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 2 );

          delete o.value;

          t.is ( calls, 2 );
          await tick ();
          t.is ( calls, 2 );

        });

        it.skip ( 'supports reacting to hasOwnProperty property checks, adding', async t => { // This is problematic to support, too many built-ins read descriptors, with no intention of tracking

          const o = $.store ( {} );

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            if ( o.hasOwnProperty ( 'value' ) ) {}
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );

          o.value = undefined;

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 2 );

          o.value = undefined;

          t.is ( calls, 2 );
          await tick ();
          t.is ( calls, 2 );

        });

        it ( 'survives reading a value inside a discarded root', async t => {

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

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );

          o.value = 321;

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 2 );

        });

        it ( 'supports reacting to changes of keys caused by Object.defineProperty, adding enumerable property', async t => {

          const o = $.store ( {} );

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            Object.keys ( o );
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );
          t.is ( o.value, undefined );

          Object.defineProperty ( o, 'value', {
            enumerable: true,
            value: 123
          });

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 2 );
          t.is ( o.value, 123 );

        });

        it ( 'supports reacting to changes of keys caused by Object.defineProperty, deleting enumerable property', async t => {

          const o = $.store ( { value: 1 } );

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            Object.keys ( o );
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );
          t.is ( o.value, 1 );

          Object.defineProperty ( o, 'value', {
            enumerable: false,
            value: 123
          });

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 2 );
          t.is ( o.value, 123 );

        });

        it ( 'supports not reacting to changes of keys caused by Object.defineProperty, overriding enumerable property', async t => {

          const o = $.store ( { value: 1 } );

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            Object.keys ( o );
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );
          t.is ( o.value, 1 );

          Object.defineProperty ( o, 'value', {
            enumerable: true,
            value: 123
          });

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 1 );
          t.is ( o.value, 123 );

        });

        it ( 'supports not reacting to changes of keys caused by Object.defineProperty, adding non-enumerable property', async t => {

          const o = $.store ( {} );

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            Object.keys ( o );
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );
          t.is ( o.value, undefined );

          Object.defineProperty ( o, 'value', {
            enumerable: false,
            value: 123
          });

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 1 );
          t.is ( o.value, 123 );

        });

        it ( 'supports reacting to changes of in caused by Object.defineProperty, adding enumerable property', async t => {

          const o = $.store ( {} );

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            if ( 'value' in o ) {}
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );
          t.is ( o.value, undefined );

          Object.defineProperty ( o, 'value', {
            enumerable: true,
            value: 123
          });

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 2 );
          t.is ( o.value, 123 );

        });

        it ( 'supports not reacting to changes of in caused by Object.defineProperty, making the property non-enumerable', async t => {

          const o = $.store ( { value: 1 } );

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            if ( 'value' in o ) {}
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );
          t.is ( o.value, 1 );

          Object.defineProperty ( o, 'value', {
            enumerable: false,
            value: 123
          });

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 1 );
          t.is ( o.value, 123 );

        });

        it ( 'supports not reacting to changes of in caused by Object.defineProperty, overriding enumerable property', async t => {

          const o = $.store ( { value: 1 } );

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            if ( 'value' in o ) {}
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );
          t.is ( o.value, 1 );

          Object.defineProperty ( o, 'value', {
            enumerable: true,
            value: 123
          });

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 1 );
          t.is ( o.value, 123 );

        });

        it ( 'supports reacting to changes of in caused by Object.defineProperty, adding non-enumerable property', async t => {

          const o = $.store ( {} );

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            if ( 'value' in o ) {}
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );
          t.is ( o.value, undefined );

          Object.defineProperty ( o, 'value', {
            enumerable: false,
            value: 123
          });

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 2 );
          t.is ( o.value, 123 );

        });

        it ( 'supports reacting to changes in getters caused by Object.defineProperty, addition', async t => {

          const o = $.store ( { foo: 1, bar: 2 } );

          let calls = 0;
          let args = [];

          $.effect ( () => {
            calls += 1;
            args.push ( o.fn );
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );
          t.deepEqual ( args, [undefined] );

          Object.defineProperty ( o, 'fn', {
              get: function () {
                return this.foo + this.bar;
              }
            }
          );

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 2 );
          t.deepEqual ( args, [undefined, 3] );

        });

        it ( 'supports reacting to changes in getters caused by Object.defineProperty, override with value', async t => {

          const o = $.store ( { foo: 1, bar: 2, get fn () { return this.foo + this.bar; } } );

          let calls = 0;
          let args = [];

          $.effect ( () => {
            calls += 1;
            args.push ( o.fn );
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );
          t.deepEqual ( args, [3] );

          Object.defineProperty ( o, 'fn', {
              value: 123
            }
          );

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 2 );
          t.deepEqual ( args, [3, 123] );

        });

        it ( 'supports reacting to changes in getters caused by Object.defineProperty, override with new getter', async t => {

          const o = $.store ( { foo: 1, bar: 2, get fn () { return this.foo + this.bar; } } );

          let calls = 0;
          let args = [];

          $.effect ( () => {
            calls += 1;
            args.push ( o.fn );
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );
          t.deepEqual ( args, [3] );

          Object.defineProperty ( o, 'fn', {
              get: function () {
                return ( this.foo + this.bar ) * 10;
              }
            }
          );

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 2 );
          t.deepEqual ( args, [3, 30] );

        });

        it ( 'supports not reacting to changes in getters caused by Object.defineProperty, override with same getter', async t => {

          const o = $.store ( { foo: 1, bar: 2, get fn () { return this.foo + this.bar; } } );

          let calls = 0;
          let args = [];

          $.effect ( () => {
            calls += 1;
            args.push ( o.fn );
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );
          t.deepEqual ( args, [3] );

          Object.defineProperty ( o, 'fn', {
              get: Object.getOwnPropertyDescriptor ( o, 'fn' ).get
            }
          );

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 1 );
          t.deepEqual ( args, [3] );

        });

        it ( 'supports not reacting to changes for a provably equivalent property descriptors set by Object.defineProperty', async t => {

          const o = $.store ( { foo: 1, bar: 2, get baz () { return 1; }, set baz ( value ) {} } );

          let calls = 0;
          let args = [];

          $.effect ( () => {
            calls += 1;
            args.push ( o.foo );
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );
          t.deepEqual ( args, [1] );

          Object.defineProperty ( o, 'foo', Object.getOwnPropertyDescriptor ( o, 'foo' ) );
          Object.defineProperty ( o, 'bar', Object.getOwnPropertyDescriptor ( o, 'bar' ) );
          Object.defineProperty ( o, 'baz', Object.getOwnPropertyDescriptor ( o, 'baz' ) );

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 1 );
          t.deepEqual ( args, [1] );

        });

        it ( 'supports reacting to changes in setters caused by Object.defineProperty, addition', async t => {

          const o = $.store ( { foo: 1, bar: 2 } );

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            o.fn = 3;
            o.fn;
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );
          t.is ( o.fn, 3 );
          t.is ( o._fn, undefined );

          Object.defineProperty ( o, 'fn', {
              set: function ( value ) {
                return this._fn = value * 10;
              }
            }
          );

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 2 );
          t.is ( o.fn, undefined );
          t.is ( o._fn, 30 );

        });

        it.skip ( 'supports reacting to changes in setters caused by Object.defineProperty, override with new setter', async t => { //TODO: Maybe too expensive to support

          const o = $.store ( { foo: 1, bar: 2, set fn ( value ) { this._fn = value; } } );

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            o.fn = 3;
            o.fn;
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );
          t.is ( o._fn, 3 );

          Object.defineProperty ( o, 'fn', {
              set: function ( value ) {
                return this._fn = value * 10;
              }
            }
          );

          t.is ( calls, 1 );
          await tick ();
          // t.is ( calls, 2 );
          // t.is ( o._fn, 30 );

        });

        it ( 'supports not reacting to changes in setters caused by Object.defineProperty, override with same setter', async t => {

          const o = $.store ( { foo: 1, bar: 2, set fn ( value ) { this._fn = value; } } );

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            o.fn = 3;
            o.fn;
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );
          t.is ( o._fn, 3 );

          Object.defineProperty ( o, 'fn', {
              set: Object.getOwnPropertyDescriptor ( o, 'fn' ).set
            }
          );

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 1 );
          t.is ( o._fn, 3 );

        });

        it ( 'supports reacting to changes of value caused by Object.defineProperty', async t => {

          const o = $.store ( { value: 1 } );

          let calls = 0;
          let args = [];

          $.effect ( () => {
            calls += 1;
            args.push ( o.value );
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );
          t.deepEqual ( args, [1] );

          Object.defineProperty ( o, 'value', {
              value: 123
            }
          );

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 2 );
          t.deepEqual ( args, [1, 123] );

        });

        it ( 'supports not reacting to changes of value caused by Object.defineProperty', async t => {

          const o = $.store ( { value: 123 } );

          let calls = 0;
          let args = [];

          $.effect ( () => {
            calls += 1;
            args.push ( o.value );
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );
          t.deepEqual ( args, [123] );

          Object.defineProperty ( o, 'value', {
              value: 123
            }
          );

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 1 );
          t.deepEqual ( args, [123] );

        });

        it ( 'treats number and string properties the same way', async t => {

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

          t.is ( callsNumber, 0 );
          t.is ( callsString, 0 );
          await tick ();
          t.is ( callsNumber, 1 );
          t.is ( callsString, 1 );

          o[0] = 1;

          t.is ( callsNumber, 1 );
          t.is ( callsString, 1 );
          await tick ();
          t.is ( callsNumber, 2 );
          t.is ( callsString, 2 );

          o['0'] = 2;

          t.is ( callsNumber, 2 );
          t.is ( callsString, 2 );
          await tick ();
          t.is ( callsNumber, 3 );
          t.is ( callsString, 3 );

        });

      });

      describe ( 'on', () => {

        it ( 'automatically batches listeners', async t => {

          const o = $.store ( { foo: 1, bar: 1 } );

          let calls = 0;

          $.store.on ( o, () => calls += 1 );

          o.foo = 2;
          o.foo = 3;
          o.bar = 2;
          o.bar = 3;

          t.is ( calls, 0 );

          await tick ();

          t.is ( calls, 1 );

        });

        it ( 'automatically waits for an async batch to resolve', async t => {

          const o = $.store ({ foo: 1 });

          let calls = '';

          $.effect ( () => {

            o.foo;

            calls += 'r';

          });

          $.store.on ( o, () => {

            calls += 's';

          });

          await tick ();

          t.is ( calls, 'r' );

          await $.batch ( async () => {

            await delay ( 25 );

            o.foo = 2;

            await delay ( 25 );

            t.is ( calls, 'r' );

          });

          await tick ();

          t.is ( calls, 'rrs' );

        });

        it ( 'detects when a new property is added', async t => {

          const o = $.store ( { foo: 1 } );

          let calls = 0;

          $.store.on ( o, () => calls += 1 );

          o.bar = undefined;

          t.is ( calls, 0 );

          await tick ();

          t.is ( calls, 1 );

        });

        it ( 'detects when a new property is added with Object.defineProperty', async t => {

          const o = $.store ( { foo: 1 } );

          let calls = 0;

          $.store.on ( o, () => calls += 1 );

          Object.defineProperty ( o, 'bar', {
            value: 1
          });

          t.is ( calls, 0 );

          await tick ();

          t.is ( calls, 1 );

        });

        it ( 'detects when a property is deleted', async t => {

          const o = $.store ( { foo: 1, bar: 1 } );

          let calls = 0;

          $.store.on ( o, () => calls += 1 );

          delete o.bar;

          t.is ( calls, 0 );

          await tick ();

          t.is ( calls, 1 );

        });

        it ( 'detects when nothing changes when setting', async t => {

          const o = $.store ( { foo: { value: 1 }, bar: { value: 1 } } );

          let calls = 0;

          $.store.on ( [() => o.foo.value, o.bar], () => calls += 1 );

          o.foo.value = 1;

          t.is ( calls, 0 );

          await tick ();

          t.is ( calls, 0 );

        });

        it ( 'returns a dispose function', async t => {

          const o = $.store ( { foo: 1, bar: 1 } );

          let calls = 0;

          const dispose = $.store.on ( [() => o.foo, o], () => calls += 1 );

          dispose ();

          o.foo = 2;
          o.bar = 2;

          t.is ( calls, 0 );

          await tick ();

          t.is ( calls, 0 );

        });

        it ( 'supports listening to a single primitive', async t => {

          const o = $.store ( { foo: 1, bar: 1 } );

          let calls = 0;

          $.store.on ( () => o.foo, () => calls += 1 );

          o.foo = 2;

          t.is ( calls, 0 );

          await tick ();

          t.is ( calls, 1 );

          o.bar = 2;

          t.is ( calls, 1 );

          await tick ();

          t.is ( calls, 1 );

        });

        it ( 'supports listening to multiple primitives', async t => {

          const o = $.store ( { foo: 1, bar: 1 } );

          let calls = 0;

          $.store.on ( [() => o.foo, () => o.bar], () => calls += 1 );

          o.foo = 2;

          t.is ( calls, 0 );

          await tick ();

          t.is ( calls, 1 );

          o.bar = 2;

          t.is ( calls, 1 );

          await tick ();

          t.is ( calls, 2 );

        });

        it ( 'supports listening to a single store, object', async t => {

          const o = $.store ( { foo: 1, bar: 1 } );

          let calls = 0;

          $.store.on ( o, () => calls += 1 );

          o.foo = 2;

          t.is ( calls, 0 );

          await tick ();

          t.is ( calls, 1 );

          o.bar = 2;

          t.is ( calls, 1 );

          await tick ();

          t.is ( calls, 2 );

        });

        it ( 'supports listening to a single store, array', async t => {

          const o = $.store ([1, 2]);

          let calls = 0;

          $.store.on ( o, () => calls += 1 );

          o[2] = 3;

          t.is ( calls, 0 );

          await tick ();

          t.is ( calls, 1 );

          o[2] = 3;

          t.is ( calls, 1 );

          await tick ();

          o.length = 2;

          t.is ( calls, 1 );

          await tick ();

          t.is ( calls, 2 );

        });

        it ( 'supports listening to a single store, deep array', async t => {

          const o = $.store ({ value: [1, 2] });

          let calls = 0;

          $.store.on ( o, () => calls += 1 );

          o.value[2] = 3;

          t.is ( calls, 0 );

          await tick ();

          t.is ( calls, 1 );

          o.value[2] = 3;

          t.is ( calls, 1 );

          await tick ();

          t.is ( calls, 1 );

          o.length = 2;

          t.is ( calls, 1 );

          await tick ();

          t.is ( calls, 2 );

        });

        it ( 'supports listening to multiple stores', async t => {

          const o = $.store ( { foo: { value: 1 }, bar: { value: 1 } } );

          let calls = 0;

          $.store.on ( [o.foo, o.bar], () => calls += 1 );

          o.foo.value = 2;

          t.is ( calls, 0 );

          await tick ();

          t.is ( calls, 1 );

          o.bar.value = 2;

          t.is ( calls, 1 );

          await tick ();

          t.is ( calls, 2 );

        });

        it ( 'supports listening to multiple primitives and stores', async t => {

          const o = $.store ( { foo: { value: 1 }, bar: { value: 1 } } );

          let calls = 0;

          $.store.on ( [() => o.foo.value, o.bar], () => calls += 1 );

          o.foo.value = 2;

          t.is ( calls, 0 );

          await tick ();

          t.is ( calls, 1 );

          o.bar.value = 2;

          t.is ( calls, 1 );

          await tick ();

          t.is ( calls, 2 );

        });

        it ( 'supports listening to a single store under multiple, fully pre-traversed, parents', async t => {

          const value = { value: 1 };
          const o = $.store ( { foo: { deep1: value }, bar: { deep2: value } } );

          let calls = '';

          o.foo.deep1.value;
          o.bar.deep2.value;

          $.store.on ( o.foo, () => calls += '1' );
          $.store.on ( o.bar, () => calls += '2' );

          o.foo.deep1.value = 2;

          t.is ( calls, '' );

          await tick ();

          t.is ( calls, '12' );

          o.bar.deep2.value = 3;

          t.is ( calls, '12' );

          await tick ();

          t.is ( calls, '1212' );

        });

        it ( 'supports listening to a raw observable', async t => {

          const o = $(1);

          let calls = '';

          $.store.on ( o, () => calls += 'a' );
          $.store.on ( () => o (), () => calls += 'b' );

          t.is ( calls, '' );

          o ( 2 );

          t.is ( calls, '' );

          await tick ()

          t.is ( calls, 'ab' );

        });

        it.skip ( 'supports listening to a single store under multiple, not fully pre-traversed, parents', async t => { //TODO: This seems unimplementable without traversing the entire structure ahead of time, which is expensive

          const value = { value: 1 };
          const o = $.store ( { foo: { deep1: value }, bar: { deep2: value } } );

          let calls = '';

          $.store.on ( o.foo, () => calls += '1' );
          $.store.on ( o.bar, () => calls += '2' );

          o.foo.deep1.value = 2;

          t.is ( calls, '' );

          await delay ( 50 );

          t.is ( calls, '12' );

          o.bar.deep2.value = 3;

          t.is ( calls, '12' );

          await delay ( 50 );

          t.is ( calls, '1212' );

        });

        it ( 'supports not reacting when setting a primitive property to itself', async t => {

          const o = $.store ( { value: 1 } );

          let calls = 0;

          $.store.on ( () => o.value, () => {
            calls += 1;
          });

          t.is ( calls, 0 );

          o.value = 1;

          await tick ();

          t.is ( calls, 0 );

        });

        it ( 'supports not reacting when setting a non-primitive property to itself', async t => {

          const o = $.store ( { deep: { value: 2 } } );

          let calls = 0;

          $.store.on ( o, () => {
            calls += 1;
          });

          t.is ( calls, 0 );

          o.deep = o.deep;

          await tick ();

          t.is ( calls, 0 );

        });

        it ( 'supports circular references', async t => {

          const circular = {};

          circular.circular = circular;

          const o = $.store ( circular );

          let calls = 0;

          $.store.on ( o, () => calls += 1 );

          o.circular.circular.circular.circular.circular.value = 1;

          t.is ( calls, 0 );

          await tick ();

          t.is ( calls, 1 );

          o.circular.circular.circular.circular.circular.circular.circular.value = 2;

          t.is ( calls, 1 );

          await tick ();

          t.is ( calls, 2 );

        });

      });

      describe ( 'onRoots', () => {

        it ( 'can detect additions', async t => {

          const store = $.store ({ a: { id: 'a' }, b: { id: 'b' } });

          $.store._onRoots ( store, roots => {
            t.is ( roots.length, 2 );
            t.true ( roots[0] === store.c );
            t.true ( roots[1] === store.d );
          });

          store.c = { id: 'c' };
          store.d = { id: 'd' };

          await tick ();

        });

        it ( 'can detect deletions', async t => {

          const store = $.store ({ a: { id: 'a' }, b: { id: 'b' } });

          const a = store.a;
          const b = store.b;

          $.store._onRoots ( store, roots => {
            t.is ( roots.length, 2 );
            t.true ( roots[0] === a );
            t.true ( roots[1] === b );
          });

          delete store.a;
          delete store.b;

          await tick ();

        });

        it ( 'can detect mutations', async t => {

          const store = $.store ({ a: { id: 'a' }, b: { id: 'b' } });

          $.store._onRoots ( store, roots => {
            t.is ( roots.length, 2 );
            t.true ( roots[0] === store.a );
            t.true ( roots[1] === store.b );
          });

          store.a.value = 1;
          store.b.value = 1;

          await tick ();

        });

        it ( 'can detect defined properties', async t => {

          const store = $.store ({ a: { id: 'a' }, b: { id: 'b' } });

          $.store._onRoots ( store, roots => {
            t.is ( roots.length, 1 );
            t.true ( roots[0] === store.c );
          });

          Object.defineProperty ( store, 'c', {
            enumerable: true,
            configurable: true,
            value: {
              id: 'c'
            }
          });

          await tick ();

        });

        it ( 'can detect defined properties that overwrite', async t => {

          const store = $.store ({ a: { id: 'a' }, b: { id: 'b' } });

          const a = store.a;

          $.store._onRoots ( store, roots => {
            t.is ( roots.length, 2 );
            t.true ( roots[0] === a );
            t.true ( roots[1] === store.a );
          });

          Object.defineProperty ( store, 'a', {
            enumerable: true,
            configurable: true,
            value: {
              id: 'c'
            }
          });

          await tick ();

        });

        it ( 'can deduplicate mutations', async t => {

          const store = $.store ({ a: { id: 'a' }, b: { id: 'b' } });

          $.store._onRoots ( store, roots => {
            t.is ( roots.length, 2 );
            t.true ( roots[0] === store.a );
            t.true ( roots[1] === store.b );
          });

          store.a.foo = 1;
          store.b.foo = 1;
          store.a.bar = 1;
          store.b.bar = 1;

          await tick ();

        });

        it ( 'supports circular references', async t => {

          const circular = {};

          circular.circular = circular;

          const store = $.store ({ circular });

          let calls = 0;

          $.store._onRoots ( store, roots => {
            calls += 1;
            t.is ( roots.length, 1 );
            t.true ( roots[0] === store.circular );
          });

          store.circular.circular.circular.circular.circular.value = 1;

          t.is ( calls, 0 );

          await tick ();

          t.is ( calls, 1 );

          store.circular.circular.circular.circular.circular.circular.circular.value = 2;

          t.is ( calls, 1 );

          await tick ();

          t.is ( calls, 2 );

        });

        it ( 'supports only top-level stores', t => {

          const store = $.store ({ a: { id: 'a' }, b: { id: 'b' } });

          try {

            $.store._onRoots ( store.a, () => {} );

          } catch ( error ) {

            t.true ( error instanceof Error );
            t.is ( error.message, 'Only top-level stores are supported' );

          }

        });

      });

      describe ( 'reconcile', () => {

        it ( 'reconciles a store with another', t => {

          const data = { foo: { deep: { value: 123, value2: true } }, arr1: ['a', 'b', 'c'], arr2: ['a', 'b'] };
          const dataNext = { foo: { deep: { value: 321, value3: 123 } }, arr1: ['d', 'e'], arr2: ['d', 'e', 'f'], value: true };

          const o = $.store ( data );

          t.notDeepEqual ( o, dataNext );

          $.store.reconcile ( o, dataNext );

          t.deepEqual ( o, dataNext );

        });

        it ( 'can shrink the size of a top-level array', t => {

          const data = ['a', 'b', 'c'];
          const dataNext = ['a', 'b'];

          const o = $.store ( data );

          t.notDeepEqual ( o, dataNext );

          $.store.reconcile ( o, dataNext );

          t.deepEqual ( o, dataNext );

        });

        it ( 'can grow the size of a top-level array', t => {

          const data = ['a', 'b'];
          const dataNext = ['a', 'b', 'c'];

          const o = $.store ( data );

          t.notDeepEqual ( o, dataNext );

          $.store.reconcile ( o, dataNext );

          t.deepEqual ( o, dataNext );

        });

      });

      describe ( 'untrack', () => {

        it ( 'does nothing for primitives', t => {

          const o = $.store ( { foo: $.store.untrack ( 123 ) } );

          t.is ( o.foo, 123 );

        });

        it ( 'supports bailing out of tracking for an outer object', async t => {

          const o = $.store ( $.store.untrack ( {} ) );

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            o.value;
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );
          t.is ( $.isStore ( o ), false );

          o.value = 123;

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 1 );
          t.is ( $.isStore ( o ), false );

        });

        it ( 'supports bailing out of tracking for an inner object', async t => {

          const o = $.store ( { foo: $.store.untrack ( {} ) } );

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            o.foo.value;
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );
          t.is ( $.isStore ( o.foo ), false );

          o.foo.value = 123;

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 1 );
          t.is ( $.isStore ( o.foo ), false );

        });

      });

      describe ( 'unwrap', () => {

        it ( 'supports unwrapping a plain object', t => {

          const wrapped = $.store ( { value: [] } );

          t.true ( $.isStore ( wrapped ) );
          t.true ( $.isStore ( wrapped.value ) );

          const unwrapped = $.store.unwrap ( wrapped );

          t.false ( $.isStore ( unwrapped ) );
          t.false ( $.isStore ( unwrapped.value ) );

        });

        it ( 'supports unwrapping an array', t => {

          const wrapped = $.store ( [{}] );

          t.true ( $.isStore ( wrapped ) );
          t.true ( $.isStore ( wrapped[0] ) );

          const unwrapped = $.store.unwrap ( wrapped );

          t.false ( $.isStore ( unwrapped ) );
          t.false ( $.isStore ( unwrapped[0] ) );

        });

        it ( 'supports wrapping, unwrapping, and re-wrapping without losing reactivity', async t => {

          const o = $.store ( { foo: 1 } );

          let calls = 0;

          $.effect ( () => {
            calls += 1;
            o.foo;
          });

          t.is ( calls, 0 );
          await tick ();
          t.is ( calls, 1 );

          const rewrapped = $.store ( $.store.unwrap ( o ) );

          rewrapped.foo = 10;

          t.is ( calls, 1 );
          await tick ();
          t.is ( calls, 2 );
          t.is ( o.foo, 10 );
          t.is ( rewrapped.foo, 10 );

        });

        it ( 'supports unwrapping properly after setting a store into the other, directly', t => {

          const store1 = $.store ({ foo: 1 });
          const store2 = $.store ({ bar: 1 });

          store1.deep = store2;

          t.true ( $.isStore ( store1.deep ) );
          t.false ( $.isStore ( $.store.unwrap ( store1 ).deep ) );

        });

        it ( 'supports unwrapping properly after setting a store into the other, with defineProperty', t => {

          const store1 = $.store ({ foo: 1 });
          const store2 = $.store ({ bar: 1 });

          Object.defineProperty ( store1, 'deep', {
            enumerable: true,
            configurable: true,
            value: store2
          });

          t.true ( $.isStore ( store1.deep ) );
          t.false ( $.isStore ( $.store.unwrap ( store1 ).deep ) );

        });

      });

    });

  });

  describe ( 'suspended', it => {

    it ( 'returns an observable that tells if the parent got suspended or not', async t => {

      const a = $(1);
      const values = [];
      const branch = $(false);

      $.suspense ( branch, () => {

        const suspended = $.suspended ();

        $.effect ( () => {

          values.push ( suspended () );

        }, { suspense: false } );

      });

      await tick ();

      branch ( true );

      await tick ();

      branch ( false );

      await tick ();

      t.deepEqual ( values, [false, true, false] );

    });

    it ( 'returns a readable observable', t => {

      const o = $.suspended ();

      isFrozen ( t, o );

    });

  });

  describe ( 'suspense', it => {

    it ( 'can accept a primitive falsy condition', async t => {

      const o = $(0);
      const suspended = 0;

      let calls = 0;

      $.suspense ( suspended, () => {

        $.effect ( () => {

          calls += 1;

          o ();

        });

      });

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 1 );

      o ( 1 );

      t.is ( calls, 1 );
      await tick ();
      t.is ( calls, 2 );

    });

    it ( 'can accept a primitive truthy condition', async t => {

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
      await tick ();
      t.is ( calls, 0 );

      o ( 1 );

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 0 );

    });

    it ( 'can accept a function condition', async t => {

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

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 1 );

      suspended ( false );

      o ( 1 );

      t.is ( calls, 1 );
      await tick ();
      t.is ( calls, 1 );

    });

    it ( 'can suspend and unsuspend again when the condition changes', async t => {

      const o = $(0);
      const suspended = $(false);

      let calls = 0;

      $.suspense ( suspended, () => {

        $.effect ( () => {

          calls += 1;

          o ();

        });

      });

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 1 );

      suspended ( true );
      suspended ( true );

      o ( 1 );

      t.is ( calls, 1 );
      await tick ();
      t.is ( calls, 1 );

      suspended ( false );
      suspended ( false );

      t.is ( calls, 1 );
      await tick ();
      t.is ( calls, 2 );

      suspended ( 1 );
      suspended ( 1 );

      o ( 2 );

      t.is ( calls, 2 );
      await tick ();
      t.is ( calls, 2 );

      suspended ( 0 );
      suspended ( 0 );

      t.is ( calls, 2 );
      await tick ();
      t.is ( calls, 3 );

    });

    it ( 'can suspend and unsuspend the execution of a an effect', async t => {

      const o = $(0);
      const suspended = $(false);

      let calls = 0;

      $.suspense ( suspended, () => {

        $.effect ( () => {

          calls += 1;

          o ();

        });

      });

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 1 );

      suspended ( true );

      o ( 1 );

      t.is ( calls, 1 );
      await tick ();
      t.is ( calls, 1 );

      suspended ( false );

      t.is ( calls, 1 );
      await tick ();
      t.is ( calls, 2 );

    });

    it ( 'can suspend and unsuspend the execution of a sync effect', t => {

      const o = $(0);
      const suspended = $(false);

      let calls = 0;

      $.suspense ( suspended, () => {

        $.effect ( () => {

          calls += 1;

          o ();

        }, { sync: true } );

      });

      t.is ( calls, 1 );

      suspended ( true );

      o ( 1 );

      t.is ( calls, 1 );

      suspended ( false );

      t.is ( calls, 2 );

    });

    it ( 'can suspend and unsuspend the execution of an effect created in a context', async t => {

      const o = $(0);
      const suspended = $(false);

      let sequence = '';

      $.suspense ( suspended, () => {

        $.context ( {}, () => {

          sequence += 'a';

          $.effect ( () => {

            sequence += 'b';

            o ();

          });

        });

      });

      t.is ( sequence, 'a' );
      await tick ();
      t.is ( sequence, 'ab' );

      suspended ( true );

      o ( 1 );

      t.is ( sequence, 'ab' );
      await tick ();
      t.is ( sequence, 'ab' );

      suspended ( false );

      t.is ( sequence, 'ab' );
      await tick ();
      t.is ( sequence, 'abb' );

    });

    it ( 'can suspend and unsuspend the execution of an effect created in an effect', async t => {

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

      t.is ( sequence, '' );
      await tick ();
      t.is ( sequence, 'ab' );

      suspended ( true );

      o ( 1 );

      t.is ( sequence, 'ab' );
      await tick ();
      t.is ( sequence, 'ab' );

      suspended ( false );

      t.is ( sequence, 'ab' );
      await tick ();
      t.is ( sequence, 'abb' );

    });

    it ( 'can suspend and unsuspend the execution of an effect created in a memo', async t => {

      const o = $(0);
      const suspended = $(false);

      let sequence = '';

      $.suspense ( suspended, () => {

        const memo = $.memo ( () => {

          sequence += 'a';

          $.effect ( () => {

            sequence += 'b';

            o ();

          });

        });

        memo ();

      });

      t.is ( sequence, 'a' );
      await tick ();
      t.is ( sequence, 'ab' );

      suspended ( true );

      o ( 1 );

      t.is ( sequence, 'ab' );
      await tick ();
      t.is ( sequence, 'ab' );

      suspended ( false );

      t.is ( sequence, 'ab' );
      await tick ();
      t.is ( sequence, 'abb' );

    });

    it ( 'can suspend and unsuspend the execution of an effect created in a root', async t => {

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

      t.is ( sequence, 'a' );
      await tick ();
      t.is ( sequence, 'ab' );

      suspended ( true );

      o ( 1 );

      t.is ( sequence, 'ab' );
      await tick ();
      t.is ( sequence, 'ab' );

      suspended ( false );

      t.is ( sequence, 'ab' );
      await tick ();
      t.is ( sequence, 'abb' );

    });

    it ( 'can suspend and unsuspend the execution of an effect created in a for', async t => {

      const o = $(0);
      const suspended = $(false);
      const array = [1, 2, 3];

      let calls = 0;

      $.suspense ( suspended, () => {
        const memo = $.for ( array, () => {
          $.effect ( () => {
            calls += 1;
            o ();
          });
        }, [], { unkeyed: true } );
        memo ();
      });

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 3 );

      suspended ( true );

      o ( 1 );

      t.is ( calls, 3 );
      await tick ();
      t.is ( calls, 3 );

      suspended ( false );

      t.is ( calls, 3 );
      await tick ();
      t.is ( calls, 6 );

    });

    it ( 'can suspend and unsuspend the execution of an effect created in a forValue', async t => {

      const o = $(0);
      const suspended = $(false);
      const array = [1, 2, 3];

      let calls = 0;

      $.suspense ( suspended, () => {
        const memo = $.for ( array, () => {
          $.effect ( () => {
            calls += 1;
            o ();
          });
        }, [], { unkeyed: true } );
        memo ();
      });

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 3 );

      suspended ( true );

      o ( 1 );

      t.is ( calls, 3 );
      await tick ();
      t.is ( calls, 3 );

      suspended ( false );

      t.is ( calls, 3 );
      await tick ();
      t.is ( calls, 6 );

    });

    it ( 'can suspend and unsuspend the execution of an effect created in a suspense', async t => {

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

      t.is ( sequence, 'a' );
      await tick ();
      t.is ( sequence, 'ab' );

      suspended ( true );

      o ( 1 );

      t.is ( sequence, 'ab' );
      await tick ();
      t.is ( sequence, 'ab' );

      suspended ( false );

      t.is ( sequence, 'ab' );
      await tick ();
      t.is ( sequence, 'abb' );

    });

    it ( 'can unsuspend only when all parents are unsuspended too', async t => {

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
      await tick ();
      t.is ( sequence, '' );

      c ( false );

      t.is ( sequence, '' );
      await tick ();
      t.is ( sequence, '' );

      b ( false );

      t.is ( sequence, '' );
      await tick ();
      t.is ( sequence, '' );

      a ( false );

      t.is ( sequence, '' );
      await tick ();
      t.is ( sequence, 'abc' );

    });

    it ( 'can suspend a lazily-crated effect', async t => {

      const o = $(0);
      const lazy = $(false);
      const suspended = $(true);

      let calls = 0;

      $.suspense ( suspended, () => {

        const memo = $.memo ( () => {

          if ( !lazy () ) return;

          $.effect ( () => {

            calls += 1;

            o ();

          });

        });

        $.effect ( () => {

          memo ();

        }, { suspense: false } );

      });

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 0 );

      lazy ( true );

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 0 );

      suspended ( false );

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 1 );

    });

    it ( 'can suspend a lazily-crated suspense', async t => {

      const o = $(0);
      const lazy = $(false);
      const suspended = $(true);

      let calls = 0;

      $.suspense ( suspended, () => {

        const memo = $.memo ( () => {

          if ( !lazy () ) return;

          $.suspense ( false, () => {

            $.effect ( () => {

              calls += 1;

              o ();

            });

          });

        });

        $.effect ( () => {

          memo ();

        }, { suspense: false } );

      });

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 0 );

      lazy ( true );

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 0 );

      suspended ( false );

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 1 );

    });

    it ( 'can not suspend an effect with suspense disabled', async t => {

      const o = $(0);
      const suspended = $(false);

      let calls = 0;

      $.suspense ( suspended, () => {

        $.effect ( () => {

          calls += 1;

          o ();

        }, { suspense: false } );

      });

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 1 );

      suspended ( true );

      o ( 1 );

      t.is ( calls, 1 );
      await tick ();
      t.is ( calls, 2 );

      suspended ( false );

      t.is ( calls, 2 );
      await tick ();
      t.is ( calls, 2 );

    });

    it ( 'can not suspend a memo', t => {

      const o = $(0);
      const suspended = $(false);

      let calls = 0;

      const memo = $.suspense ( suspended, () => {

        return $.memo ( () => {

          calls += 1;

          o ();

        });

      });

      t.is ( calls, 0 );
      t.is ( memo (), undefined );
      t.is ( calls, 1 );

      suspended ( true );

      o ( 1 );

      t.is ( calls, 1 );
      t.is ( memo (), undefined );
      t.is ( calls, 2 );

      suspended ( false );

      t.is ( calls, 2 );
      t.is ( memo (), undefined );
      t.is ( calls, 2 );

    });

    it ( 'does not call immediately an unsuspended async effect', async t => {

      const suspended = $(true);

      let calls = 0;

      $.suspense ( suspended, () => {
        $.effect ( () => {
          calls += 1;
        });
      });

      t.is ( calls, 0 );

      suspended ( false );

      t.is ( calls, 0 );

      await tick ();

      t.is ( calls, 1 );

    });

    it ( 'does call immediately a sync effect', async t => {

      const suspended = $(true);

      let calls = 0;

      $.suspense ( suspended, () => {
        $.effect ( () => {
          calls += 1;
        }, { sync: true } );
      });

      t.is ( calls, 0 );

      suspended ( false );

      t.is ( calls, 1 );

    });

    it ( 'does call immediately an init effect', async t => {

      const suspended = $(true);

      let calls = 0;

      $.suspense ( suspended, () => {
        $.effect ( () => {
          calls += 1;
        }, { sync: 'init' } );
      });

      t.is ( calls, 0 );

      suspended ( false );

      t.is ( calls, 1 );

    });

    it ( 'returns whatever the function returns', t => {

      const result = $.suspense ( false, () => {

        return 123;

      });

      t.is ( result, 123 );

    });

    it ( 'starts unsuspended with no parent and a false condition', async t => {

      const o = $(0);
      const suspended = $(false);

      let calls = 0;

      $.suspense ( suspended, () => {

        $.effect ( () => {

          calls += 1;

          o ();

        });

      });

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 1 );

      suspended ( true );

      o ( 1 );

      t.is ( calls, 1 );
      await tick ();
      t.is ( calls, 1 );

      suspended ( false );

      t.is ( calls, 1 );
      await tick ();
      t.is ( calls, 2 );

    });

    it ( 'starts unsuspended with an unsuspended parent and a false condition', async t => {

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

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 1 );

      suspended ( true );

      o ( 1 );

      t.is ( calls, 1 );
      await tick ();
      t.is ( calls, 1 );

      suspended ( false );

      t.is ( calls, 1 );
      await tick ();
      t.is ( calls, 2 );

    });

    it ( 'starts suspended with a suspended parent and a false condition', async t => {

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
      await tick ();
      t.is ( calls, 0 );

      suspended ( false );

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 1 );

      o ( 1 );

      t.is ( calls, 1 );
      await tick ();
      t.is ( calls, 2 );

    });

    it ( 'starts suspended with an unuspended parent and a true condition', async t => {

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
      await tick ();
      t.is ( calls, 0 );

      suspended ( false );

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 0 );

    });

    it ( 'starts suspended with a suspended parent and a true condition', async t => {

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
      await tick ();
      t.is ( calls, 0 );

      suspended ( false );

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 0 );

    });

    it ( 'supports cleaning up suspended, but executed, effects', async t => {

      const suspended = $(false);

      let calls = 0;

      await $.root ( async dispose => {

        $.suspense ( suspended, () => {

          $.effect ( () => {

            $.cleanup ( () => {

              calls += 1;

            });

          });

        });

        await tick ();

        suspended ( true );

        t.is ( calls, 0 );

        dispose ();

        t.is ( calls, 1 );

      });

    });

    it ( 'supports not cleaning suspended, and never executed, effects', async t => {

      const suspended = $(true);

      let calls = 0;

      await $.root ( async dispose => {

        $.suspense ( suspended, () => {

          $.effect ( () => {

            $.cleanup ( () => {

              calls += 1;

            });

          });

        });

        await tick ();

        dispose ();

        t.is ( calls, 0 );

      });

    });

    it ( 'supports unsuspending with a disposed always-suspended effect without causing the effect to be executed', async t => {

      const suspended = $(true);

      let calls = 0;

      await $.suspense ( suspended, () => {

        return $.root ( async dispose => {

          $.effect ( () => {

            calls += 1;

          });

          await tick ();

          dispose ();

          suspended ( false );

          await tick ();

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

      const memo = $.switch ( condition, [[0, value0], [1, value1], [valueDefault]] );

      t.is ( memo ()(), undefined );

      condition ( 0 );

      t.is ( sequence, '0' );

      condition ( 1 );

      t.is ( memo ()(), undefined );

      condition ( 1 );

      t.is ( memo ()(), undefined );

      t.is ( sequence, '01' );

      condition ( 2 );

      t.is ( memo ()(), undefined );

      condition ( 3 );

      t.is ( memo ()(), undefined );

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

    it ( 'resolves the fallback once value before returning it, even if needed multiple times in a sequence', t => {

      const o = $(2);

      let calls = 0;

      const memo = $.switch ( o, [[1, '1']], () => () => {
        calls += 1;
        return 321;
      });

      t.is ( calls, 0 );

      t.is ( memo ()()(), 321 );

      t.is ( calls, 1 );

      o ( 3 );

      t.is ( memo ()()(), 321 );

      t.is ( calls, 1 );

      o ( 4 );

      t.is ( memo ()()(), 321 );

      t.is ( calls, 1 );

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

      const memo = $.ternary ( condition, valueTrue, valueFalse );

      condition ( 2 );

      t.is ( memo ()(), undefined );

      condition ( 3 );

      t.is ( memo ()(), undefined );

      t.is ( sequence, 't' );

      condition ( 0 );

      t.is ( memo ()(), undefined );

      condition ( false );

      t.is ( memo ()(), undefined );

      t.is ( sequence, 'tf' );

      condition ( 4 );

      t.is ( memo ()(), undefined );

      condition ( 5 );

      t.is ( memo ()(), undefined );

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

  describe ( 'tick', it => {

    it ( 'flushes any scheduled effects immediately', t => {

      const o = $(0);

      let calls = 0;

      $.effect ( () => {
        calls += 1;
        o ();
      });

      t.is ( calls, 0 );
      $.tick ();
      t.is ( calls, 1 );

      o ( 1 );

      t.is ( calls, 1 );
      $.tick ();
      t.is ( calls, 2 );

    });

    it ( 'flushes any scheduled effects recursively', t => {

      const a = $(0);
      const b = $(0);

      let calls = 0;

      $.effect ( () => {
        calls += 1;
        if ( $.untrack ( b ) >= 5 ) return;
        b ( a () + 1 );
      });

      $.effect ( () => {
        calls += 1;
        if ( $.untrack ( a ) >= 5 ) return;
        a ( b () + 1 );
      });

      t.is ( calls, 0 );
      $.tick ();
      t.is ( calls, 7 );

    });

  });

  describe ( 'tryCatch', it => {

    //TODO: These "settle" calls look a bit ugly, but maybe no way around them with a lazy system?

    it ( 'can catch and recover from errors', t => {

      const o = $(false);

      let err;
      let recover;

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

      t.is ( settle ( memo ), 'regular' );

      o ( true );

      t.is ( settle ( memo ), 'fallback' );
      t.true ( err instanceof Error );
      t.is ( err.message, 'whoops' );

      o ( false );

      recover ();

      t.is ( settle ( memo ), 'regular' );

    });

    it ( 'casts thrown errors to Error instances', t => {

      const fallback = ({ error }) => {
        t.true ( error instanceof Error );
        t.is ( error.message, 'err' );
      };

      const regular = () => {
        throw 'err';
      };

      const memo = $.tryCatch ( regular, fallback );

      settle ( memo );

    });

    it ( 'resolves the fallback before returning it', t => {

      const result = $.tryCatch ( () => { throw 'err' }, () => () => () => 123 );

      settle ( result );

      isReadable ( t, result );
      isReadable ( t, result () );
      isReadable ( t, result ()() );

      t.is ( result ()()(), 123 );

    });

    it ( 'resolves the value before returning it', t => {

      const result = $.tryCatch ( () => () => 123, () => {} );

      settle ( result );

      isReadable ( t, result );
      isReadable ( t, result () );
      isReadable ( t, result ()() );

      t.is ( result ()()(), 123 );

    });

    it ( 'supports error handlers that throw', t => {

      let calls = '';

      const result = $.tryCatch ( () => {

        return $.tryCatch ( () => {

          return $.memo ( () => {

            throw new Error ();

          });

        }, () => {

          calls += 'b';
          throw new Error ();
          calls += 'c';

        });

      }, () => {

        calls += 'a';

      });

      settle ( result );
      settle ( result ); //FIXME: Is is correct that this is needed though?

      t.is ( calls, 'ba' );

    });

  });

  describe ( 'untrack', it => {

    it ( 'does not pass on any eventual dispose function', t => {

      $.root ( () => {

        $.untrack ( dispose => {

          t.is ( dispose, undefined );

        });

      });

    });

    it ( 'does not leak memos', t => {

      const o = $(1);

      let cleaned = false;

      const memo1 = $.memo ( () => {

        o ();

        $.untrack ( () => {

          const memo2 = $.memo ( () => {

            $.cleanup ( () => {

              cleaned = true;

            });

          });

          memo2 ();

        });

      });

      t.is ( memo1 (), undefined );
      t.is ( cleaned, false );

      o ( 2 );

      t.is ( memo1 (), undefined );
      t.is ( cleaned, true );

    });

    it ( 'does not leak effects', async t => {

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

      await tick ();

      t.is ( cleaned, false );

      o ( 2 );

      await tick ();

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

      const memo = $.memo ( () => {
        calls += 1;
        a ();
        a ();
        d ( $.untrack ( () => b () ) );
        c ();
        c ();
      });

      t.is ( calls, 0 );
      t.is ( memo (), undefined );
      t.is ( calls, 1 );
      t.is ( d (), 2 );

      b ( 4 );

      t.is ( calls, 1 );
      t.is ( memo (), undefined );
      t.is ( calls, 1 );
      t.is ( d (), 2 );

      a ( 5 );
      c ( 6 );

      t.is ( calls, 1 );
      t.is ( memo (), undefined );
      t.is ( calls, 2 );
      t.is ( d (), 4 );

    });

    it ( 'supports getting without creating dependencies in an effect', async t => {

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

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 1 );
      t.is ( d (), 2 );

      b ( 4 );

      t.is ( calls, 1 );
      await tick ();
      t.is ( calls, 1 );
      t.is ( d (), 2 );

      a ( 5 );
      c ( 6 );

      t.is ( calls, 1 );
      await tick ();
      t.is ( calls, 2 );
      t.is ( d (), 4 );

    });

    it ( 'works with functions containing a memo', async t => {

      const o = $(0);

      let calls = 0;

      $.effect ( () => {

        calls += 1;

        $.untrack ( () => {

          o ();

          const memo = $.memo ( () => {

            o ();

          });

          memo ();

          o ();

        });

      });

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 1 );

      o ( 1 );

      t.is ( calls, 1 );
      await tick ();
      t.is ( calls, 1 );

    });

    it ( 'works with functions containing an effect', async t => {

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

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 1 );

      o ( 1 );

      t.is ( calls, 1 );
      await tick ();
      t.is ( calls, 1 );

    });

    it ( 'works with functions containing a root', async t => {

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


      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 1 );

      o ( 1 );

      t.is ( calls, 1 );
      await tick ();
      t.is ( calls, 1 );

    });

    it ( 'works on the top-level computation', async t => {

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

      t.is ( sequence, '' );
      await tick ();
      t.is ( sequence, 'pc' );

      o ( 1 );

      t.is ( sequence, 'pc' );
      await tick ();
      t.is ( sequence, 'pcc' );

    });

  });

  describe ( 'untracked', it => {

    it ( 'does not pass on any eventual dispose function', t => {

      $.root ( () => {

        $.untracked ( dispose => {

          t.is ( dispose, undefined );

        })();

      });

    });

    it ( 'does not leak memos', t => {

      const o = $(1);

      let cleaned = false;

      const memo1 = $.memo ( () => {

        o ();

        $.untracked ( () => {

          const memo2 = $.memo ( () => {

            $.cleanup ( () => {

              cleaned = true;

            });

          });

          memo2 ();

        })();

      });

      t.is ( memo1 (), undefined );
      t.is ( cleaned, false );

      o ( 2 );

      t.is ( memo1 (), undefined );
      t.is ( cleaned, true );

    });

    it ( 'does not leak effects', async t => {

      const o = $(1);

      let cleaned = false;

      $.effect ( () => {

        o ();

        $.untracked ( () => {

          $.effect ( () => {

            $.cleanup ( () => {

              cleaned = true;

            });

          });

        })();

      });

      await tick ();

      t.is ( cleaned, false );

      o ( 2 );

      await tick ();

      t.is ( cleaned, true );

    });

    it ( 'marks the untracked function as such', t => {

      const untracked = $.untracked ( () => {} );

      t.is ( untracked[SYMBOL_UNTRACKED], true );

    });

    it ( 'wraps non-functions', t => {

      const values = [0, -0, Infinity, NaN, 'foo', true, false, {}, [], Promise.resolve (), new Map (), new Set (), null, undefined, Symbol ()];

      for ( const value of values ) {

        t.is ( value, $.untracked ( value )() );

      }

    });

    it ( 'supports functions with arguments', t => {

      const sum = $.untracked ( ( a, b ) => a + b );

      t.is ( sum ( 1, 2 ), 3 );

    });

    it ( 'supports getting without creating dependencies in a memo', t => {

      const a = $(1);
      const b = $(2);
      const c = $(3);
      const d = $(0);

      let calls = 0;

      const memo = $.memo ( () => {
        calls += 1;
        a ();
        a ();
        d ( $.untracked ( () => b () )() );
        c ();
        c ();
      });

      t.is ( calls, 0 );
      t.is ( memo (), undefined );
      t.is ( calls, 1 );
      t.is ( d (), 2 );

      b ( 4 );

      t.is ( calls, 1 );
      t.is ( memo (), undefined );
      t.is ( calls, 1 );
      t.is ( d (), 2 );

      a ( 5 );
      c ( 6 );

      t.is ( calls, 1 );
      t.is ( memo (), undefined );
      t.is ( calls, 2 );
      t.is ( d (), 4 );

    });

    it ( 'supports getting without creating dependencies in an effect', async t => {

      const a = $(1);
      const b = $(2);
      const c = $(3);
      const d = $(0);

      let calls = 0;

      $.effect ( () => {
        calls += 1;
        a ();
        a ();
        d ( $.untracked ( () => b () )() );
        c ();
        c ();
      });

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 1 );
      t.is ( d (), 2 );

      b ( 4 );

      t.is ( calls, 1 );
      await tick ();
      t.is ( calls, 1 );
      t.is ( d (), 2 );

      a ( 5 );
      c ( 6 );

      t.is ( calls, 1 );
      await tick ();
      t.is ( calls, 2 );
      t.is ( d (), 4 );

    });

    it ( 'works with functions containing a memo', async t => {

      const o = $(0);

      let calls = 0;

      $.effect ( () => {

        calls += 1;

        $.untracked ( () => {

          o ();

          const memo = $.memo ( () => {

            o ();

          });

          memo ();

          o ();

        })();

      });

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 1 );

      o ( 1 );

      t.is ( calls, 1 );
      await tick ();
      t.is ( calls, 1 );

    });

    it ( 'works with functions containing an effect', async t => {

      const o = $(0);

      let calls = 0;

      $.effect ( () => {

        calls += 1;

        $.untracked ( () => {

          o ();

          $.effect ( () => {

            o ();

          });

          o ();

        })();

      });

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 1 );

      o ( 1 );

      t.is ( calls, 1 );
      await tick ();
      t.is ( calls, 1 );

    });

    it ( 'works with functions containing a root', async t => {

      const o = $(0);

      let calls = 0;

      $.effect ( () => {

        calls += 1;

        $.untracked ( () => {

          o ();

          $.root ( () => {

            o ();

          });

          o ();

        })();

      });


      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 1 );

      o ( 1 );

      t.is ( calls, 1 );
      await tick ();
      t.is ( calls, 1 );

    });

    it ( 'works on the top-level computation', async t => {

      const o = $(0);

      let sequence = '';

      $.effect ( () => {

        sequence += 'p';

        $.untracked ( () => {

          o ();

          $.effect ( () => {

            sequence += 'c';

            o ();

          });

        })();

      });

      t.is ( sequence, '' );
      await tick ();
      t.is ( sequence, 'pc' );

      o ( 1 );

      t.is ( sequence, 'pc' );
      await tick ();
      t.is ( sequence, 'pcc' );

    });

  });

  describe ( 'with', it => {

    it ( 'calls the functions with no arguments, even for a root', t => {

      $.root ( () => {

        const runWithRoot = $.with ();

        runWithRoot ( ( ...args ) => {

          t.deepEqual ( args, [] );

        });

      });

    });

    it ( 'can execute a function as if it happend inside another owner', t => {

      $.root ( () => {

        const name = Symbol ();
        const value = { value: 123 };
        const context = { [name]: value };

        $.context ( context, () => {

          const runWithOuter = $.with ();

          $.root ( () => {

            const value2 = { value: 321 };
            const context2 = { [name]: value2 };

            $.context ( context2, () => {

              t.is ( $.context ( name ), value2 );

              runWithOuter ( () => {

                t.is ( $.context ( name ), value );

              });

            });

          });

        });

      });

    });

    it ( 'returns whatever the function returns', t => {

      t.is ( $.with ()( () => 123 ), 123 );

    });

    it ( 'does not override pre-exiting dependencies of effects', async t => {

      const o = $(0);

      let calls = 0;
      let runWith;

      $.effect ( () => {
        calls += 1;
        o ();
        runWith = $.with ();
      });

      t.is ( calls, 0 );
      await tick ();
      t.is ( calls, 1 );

      runWith ( () => {} );

      t.is ( calls, 1 );
      await tick ();
      t.is ( calls, 1 );

      o ( 1 );

      t.is ( calls, 1 );
      await tick ();
      t.is ( calls, 2 );

    });

    it ( 'does not override pre-exiting dependencies of effects', t => {

      const o = $(0);

      let calls = 0;
      let runWith;

      const memo = $.memo ( () => {
        calls += 1;
        o ();
        runWith = $.with ();
      });

      t.is ( calls, 0 );
      t.is ( memo (), undefined );
      t.is ( calls, 1 );

      runWith ( () => {} );

      t.is ( calls, 1 );
      t.is ( memo (), undefined );
      t.is ( calls, 1 );

      o ( 1 );

      t.is ( calls, 1 );
      t.is ( memo (), undefined );
      t.is ( calls, 2 );

    });

  });

  describe ( 'S-like propagation', it => {

    it ( 'only propagates in topological order', t => {

      //    a1
      //   /  \
      //  /    \
      // b1     b2
      //  \    /
      //   \  /
      //    c1

      let sequence = '';

      const a1 = $(0);

      const b1 = $.memo ( () => {
        sequence += 'b1';
        return a1 () + 1;
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

      t.is ( sequence, '' );
      t.is ( c1 (), undefined );
      t.is ( sequence, 'b1b2c1' );

      a1 ( 1 );

      t.is ( sequence, 'b1b2c1' );
      t.is ( c1 (), undefined );
      t.is ( sequence, 'b1b2c1b1b2c1' );

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

      t.is ( calls, 0 );
      t.is ( g (), 0 );
      t.is ( calls, 1 );

      d ( 1 );

      t.is ( calls, 1 );
      t.is ( g (), 5 )
      t.is ( calls, 2 );

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

      t.is ( calls, 0 );
      t.is ( h (), 0 );
      t.is ( calls, 1 );

      d ( 1 );

      t.is ( calls, 1 );
      t.is ( h (), 9 );
      t.is ( calls, 2 );

    });

    it ( 'parent supports going from one to two subscriptions', t => {

      const a = $(0);
      const b = $(0);

      let calls = 0;

      const memo = $.memo ( () => {

        calls += 1;

        if ( !a () ) return 1;

        b ();

        return 2;

      });

      t.is ( calls, 0 );
      t.is ( memo (), 1 );
      t.is ( calls, 1 );

      a ( 1 );

      t.is ( calls, 1 );
      t.is ( memo (), 2 );
      t.is ( calls, 2 );

      a ( 2 );

      t.is ( calls, 2 );
      t.is ( memo (), 2 );
      t.is ( calls, 3 );

      b ( 1 );

      t.is ( calls, 3 );
      t.is ( memo (), 2 );
      t.is ( calls, 4 );

    });

  });

});
