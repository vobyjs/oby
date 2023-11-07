
/* IMPORT */

import {OWNER} from '../context';
import {contextNew, contextGet} from '../objects/context';
import {ownerWrap} from '../objects/owner';
import {isSymbol, noop} from '../utils';
import type {ContextFunction, Contexts} from '../types';

/* MAIN */

function context <T> ( symbol: symbol ): T | undefined;
function context <T> ( context: Contexts, fn: ContextFunction<T> ): T;
function context <T> ( symbolOrContext: symbol | Contexts, fn?: ContextFunction<T> ) {

  if ( isSymbol ( symbolOrContext ) ) { // Get

    return contextGet<T> ( OWNER, symbolOrContext );

  } else { // Set

    const context = contextNew ( symbolOrContext );

    return ownerWrap ( fn || noop, context, false );

  }

}

/* EXPORT */

export default context;
