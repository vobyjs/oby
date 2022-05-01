
/* IMPORT */

import cleanup from '~/methods/cleanup';
import computed from '~/methods/computed';
import resolve from '~/methods/resolve';
import root from '~/methods/root';
import {isFunction} from '~/utils';
import type {DisposeFunction, ObservableReadonly, FunctionMaybe, Resolved} from '~/types';

/* MAIN */

function suspense <T, R> ( when: FunctionMaybe<T>, values: [...[T, R][], [R]] ): ObservableReadonly<Resolved<R>>;
function suspense <T, R> ( when: FunctionMaybe<T>, values: [T, R][] ): ObservableReadonly<Resolved<R | undefined>>;
function suspense <T, R> ( when: FunctionMaybe<T>, values: ([T, R] | [R])[] ): ObservableReadonly<Resolved<R | undefined>> {

  const branches: Resolved<R | undefined>[] = [];
  const disposers: DisposeFunction[] = [];

  for ( let i = 0, l = values.length; i < l; i++ ) {

    root ( dispose => {

      const value = values[i];
      const result = ( value.length === 1 ) ? value[0] : value[1];

      branches.push ( resolve ( result ) );
      disposers.push ( dispose );

    });

  }

  cleanup ( () => {

    disposers.forEach ( dispose => dispose () );

  });

  return computed ( () => {

    const condition = isFunction ( when ) ? when () : when;

    for ( let i = 0, l = values.length; i < l; i++ ) {

      const value = values[i];

      if ( value.length === 1 ) return branches[i];

      if ( Object.is ( value[0], condition ) ) return branches[i];

    }

  });

};

/* EXPORT */

export default suspense;
