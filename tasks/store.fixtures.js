
/* MAIN */

const NOOP = () => {};

const OBJ = () => ({
  str: 'string',
  null: null,
  undefined: undefined,
  nr: 123,
  bigint: 10n,
  symbol: Symbol (),
  re: /foo/g,
  fn: function () {},
  arr: [1, 2, 3, {}],
  arrBuf: new ArrayBuffer ( 12 ),
  arrTyped: new Int8Array ( new ArrayBuffer ( 24 ) ),
  obj: {
    deep: {
      deeper: true
    }
  },
  date: new Date (),
  map: new Map ([ ['1', 1], ['2', 2] ]),
  set: new Set ([ 1, 2, 3 ])
});

const OBJ_HUGE = () => ({
  arr: new Array ( 100_000 ).fill ( 0 ).map ( ( _, idx ) => idx ),
  date: new Date (),
  map: new Map ( new Array ( 100_000 ).fill ( 0 ).map ( ( _, idx ) => idx ).map ( nr => [`${nr}`, nr] ) ),
  set: new Set ( new Array ( 100_000 ).fill ( 0 ).map ( ( _, idx ) => idx ) )
});

/* EXPORT */

export {NOOP, OBJ, OBJ_HUGE};
