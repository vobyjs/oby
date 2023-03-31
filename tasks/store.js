
/* IMPORT */

import benchmark from 'benchloop';
import {setObserver, setOwner} from '../dist/context.js';
import Memo from '../dist/objects/memo.js';
import $ from '../dist/index.js';
import {NOOP, OBJ, OBJ_HUGE} from './store.fixtures.js';

/* HELPERS */ // Running the benchmark with tracking enabled

const memo = new Memo ( () => {} );

setOwner ( memo );
setObserver ( memo );

/* MAIN */

benchmark.config ({
  iterations: 5_000
});

benchmark.group ( 'wrap', () => {

  benchmark ({
    name: 'primitive',
    fn: () => {
      $.store ( 123 );
    }
  });

  benchmark ({
    name: 'object',
    fn: () => {
      $.store ( {} );
    }
  });

  benchmark ({
    name: 'array',
    fn: () => {
      $.store ( [] );
    }
  });

  benchmark ({
    name: 'deep',
    beforeEach: ctx => {
      ctx.obj = OBJ ();
    },
    fn: ctx => {
      $.store ( ctx.obj );
    }
  });

});

benchmark.group ( 'unwrap', () => {

  benchmark ({
    name: 'primitive',
    beforeEach: ctx => {
      ctx.store = $.store ( 123 );
    },
    fn: ctx => {
      $.store.unwrap ( ctx.store );
    }
  });

  benchmark ({
    name: 'object',
    beforeEach: ctx => {
      ctx.store = $.store ( {} );
    },
    fn: ctx => {
      $.store.unwrap ( ctx.store );
    }
  });

  benchmark ({
    name: 'array',
    beforeEach: ctx => {
      ctx.store = $.store ( [] );
    },
    fn: ctx => {
      $.store.unwrap ( ctx.store );
    }
  });

  benchmark ({
    name: 'deep',
    beforeEach: ctx => {
      ctx.store = $.store ( OBJ () );
    },
    fn: ctx => {
      $.store.unwrap ( ctx.store );
    }
  });

});

benchmark.group ( 'get', () => {

  benchmark ({
    name: 'primitive',
    beforeEach: ctx => {
      ctx.store = $.store ( OBJ () );
    },
    fn: ctx => {
      ctx.store.str;
      ctx.store.nr;
      ctx.store.symbol;
    }
  });

  benchmark ({
    name: 'object:shallow',
    beforeEach: ctx => {
      ctx.store = $.store ( OBJ () );
    },
    fn: ctx => {
      ctx.store.arr;
      ctx.store.obj;
    }
  });

  benchmark ({
    name: 'object:deep',
    beforeEach: ctx => {
      ctx.store = $.store ( OBJ () );
    },
    fn: ctx => {
      ctx.store.arr[3].undefined;
      ctx.store.obj.deep.deeper;
    }
  });

  benchmark ({
    name: 'array',
    beforeEach: ctx => {
      ctx.store = $.store ( OBJ () );
    },
    fn: ctx => {
      ctx.store.arr.concat ( 4 );
      ctx.store.arr.entries ();
      ctx.store.arr.every ( NOOP );
      ctx.store.arr.filter ( NOOP );
      ctx.store.arr.find ( NOOP );
      ctx.store.arr.findIndex ( NOOP );
      ctx.store.arr.forEach ( () => {} );
      ctx.store.arr.includes ( 1 );
      ctx.store.arr.indexOf ( 1 );
      ctx.store.arr.join ();
      ctx.store.arr.keys ();
      ctx.store.arr.lastIndexOf ( 1 );
      ctx.store.arr.map ( NOOP );
      ctx.store.arr.reduce ( () => ({}) );
      ctx.store.arr.reduceRight ( () => ({}) );
      ctx.store.arr.slice ();
      ctx.store.arr.some ( NOOP );
      ctx.store.arr.toLocaleString ();
      ctx.store.arr.toString ();
      ctx.store.arr.values ();
    }
  });

});

benchmark.group ( 'set', () => {

  benchmark.group ( 'no', () => {

    benchmark ({
      name: 'object:shallow',
      beforeEach: ctx => {
        ctx.store = $.store ( OBJ () );
      },
      fn: ctx => {
        ctx.store.arr[0] = 1;
      }
    });

    benchmark ({
      name: 'object:deep',
      beforeEach: ctx => {
        ctx.store = $.store ( OBJ () );
      },
      fn: ctx => {
        ctx.store.obj.deep.deeper = true;
      }
    });

    benchmark ({
      name: 'array',
      beforeEach: ctx => {
        ctx.store = $.store ( OBJ () );
      },
      fn: ctx => {
        ctx.store.arr.copyWithin ( 0, 0, 0 );
        ctx.store.arr.push ();
        ctx.store.arr.splice ( 0, 0 );
      }
    });

  });

  benchmark.group ( 'yes', () => {

    benchmark ({
      name: 'object:shallow',
      beforeEach: ctx => {
        ctx.store = $.store ( OBJ () );
      },
      fn: ctx => {
        ctx.store.arr[0] = 10;
        ctx.store.obj.foo = 10;
      }
    });

    benchmark ({
      name: 'object:deep',
      beforeEach: ctx => {
        ctx.store = $.store ( OBJ () );
      },
      fn: ctx => {
        ctx.store.arr[3].undefined = 10;
        ctx.store.obj.deep.deeper = 10;
      }
    });

    benchmark ({
      name: 'array',
      beforeEach: ctx => {
        ctx.store = $.store ( OBJ () );
      },
      fn: ctx => {
        ctx.store.arr.copyWithin ( 0, 1, 2 );
        ctx.store.arr.fill ( 0 );
        ctx.store.arr.pop ();
        ctx.store.arr.push ( -1, -2, -3 );
        ctx.store.arr.reverse ();
        ctx.store.arr.shift ();
        ctx.store.arr.sort ();
        ctx.store.arr.splice ( 0, 1, 2 );
        ctx.store.arr.unshift ( 5 );
      }
    });

  });

  benchmark.group ( 'huge', () => {

    benchmark ({
      name: 'array:copyWithin',
      before: ctx => {
        ctx.store = $.store ( OBJ_HUGE () );
      },
      fn: ctx => {
        ctx.store.arr.copyWithin ( 0, 1, 2 );
      }
    });

    benchmark.skip ({
      name: 'array:fill',
      before: ctx => {
        ctx.store = $.store ( OBJ_HUGE () );
      },
      fn: ctx => {
        ctx.store.arr.fill ( 0 );
      }
    });

    benchmark ({
      name: 'array:pop',
      before: ctx => {
        ctx.store = $.store ( OBJ_HUGE () );
      },
      fn: ctx => {
        ctx.store.arr.pop ();
      }
    });

    benchmark ({
      name: 'array:push',
      before: ctx => {
        ctx.store = $.store ( OBJ_HUGE () );
      },
      fn: ctx => {
        ctx.store.arr.push ( -1 );
      }
    });

    benchmark ({
      iterations: 1,
      name: 'array:reverse',
      before: ctx => {
        ctx.store = $.store ( OBJ_HUGE () );
      },
      fn: ctx => {
        ctx.store.arr.reverse ();
      }
    });

    benchmark ({
      iterations: 1,
      name: 'array:shift',
      before: ctx => {
        ctx.store = $.store ( OBJ_HUGE () );
      },
      fn: ctx => {
        ctx.store.arr.shift ();
      }
    });

    benchmark ({
      iterations: 1,
      name: 'array:sort',
      before: ctx => {
        ctx.store = $.store ( OBJ_HUGE () );
      },
      fn: ctx => {
        ctx.store.arr.sort ();
      }
    });

    benchmark ({
      name: 'array:splice',
      before: ctx => {
        ctx.store = $.store ( OBJ_HUGE () );
      },
      fn: ctx => {
        ctx.store.arr.splice ( 0, 1, 2 );
      }
    });

    benchmark ({
      iterations: 1,
      name: 'array:unshift',
      before: ctx => {
        ctx.store = $.store ( OBJ_HUGE () );
      },
      fn: ctx => {
        ctx.store.arr.unshift ( 5 );
      }
    });

  });

});

benchmark.group ( 'delete', () => {

  benchmark ({
    name: 'object:shallow',
    beforeEach: ctx => {
      ctx.store = $.store ( OBJ () );
    },
    fn: ctx => {
      delete ctx.store.arr;
    }
  });

  benchmark ({
    name: 'object:deep',
    beforeEach: ctx => {
      ctx.store = $.store ( OBJ () );
    },
    fn: ctx => {
      delete ctx.store.obj.deep.deeper;
    }
  });

});

benchmark.summary ();
