
/* IMPORT */

import {OWNER} from '~/context';
import Context from '~/objects/context';
import {isSymbol, noop} from '~/utils';
import type {ContextFunction, Contexts} from '~/types';

/* MAIN */

function context <T> ( symbol: symbol ): T | undefined;
function context <T> ( context: Contexts, fn: ContextFunction<T> ): T;
function context <T> ( symbolOrContext: symbol | Contexts, fn?: ContextFunction<T> ) {

  if ( isSymbol ( symbolOrContext ) ) {

    return OWNER.context[symbolOrContext];

  } else {

    return new Context ( symbolOrContext ).wrap ( fn || noop );

  }

}

/* EXPORT */

export default context;
