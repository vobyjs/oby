
/* IMPORT */

import type {LazyArray, LazySet} from '~/types';

/* MAIN */

const lazyArrayEach = <T> ( arr: LazyArray<T>, fn: ( value: T ) => void ): void => {
  if ( arr instanceof Array ) {
    for ( let i = 0, l = arr.length; i < l; i++ ) {
      fn ( arr[i] );
    }
  } else if ( arr ) {
    fn ( arr );
  }
};

const lazyArrayEachRight = <T> ( arr: LazyArray<T>, fn: ( value: T ) => void ): void => {
  if ( arr instanceof Array ) {
    for ( let i = arr.length - 1; i >= 0; i-- ) {
      fn ( arr[i] );
    }
  } else if ( arr ) {
    fn ( arr );
  }
};

const lazyArrayPush = <T, U extends string> ( obj: Partial<Record<U, LazyArray<T>>>, key: U, value: T ): void => {
  const arr: LazyArray<T> = obj[key];
  if ( arr instanceof Array ) {
    arr.push ( value );
  } else if ( arr ) {
    obj[key] = [arr, value];
  } else {
    obj[key] = value;
  }
};

const lazySetAdd = <T, U extends string> ( obj: Partial<Record<U, LazySet<T>>>, key: U, value: T ): void => {
  const set: LazySet<T> = obj[key];
  if ( set instanceof Set ) {
    set.add ( value );
  } else if ( set ) {
    if ( value !== set ) {
      const s = new Set<T> ();
      s.add ( set );
      s.add ( value );
      obj[key] = s;
    }
  } else {
    obj[key] = value;
  }
};

const lazySetDelete = <T, U extends string> ( obj: Partial<Record<U, LazySet<T>>>, key: U, value: T ): void => {
  const set: LazySet<T> = obj[key];
  if ( set instanceof Set ) {
    set.delete ( value );
  } else if ( set === value ) {
    obj[key] = undefined;
  }
};

const lazySetEach = <T> ( set: LazySet<T>, fn: ( value: T ) => void ): void => {
  if ( set instanceof Set ) {
    for ( const value of set ) {
      fn ( value );
    }
  } else if ( set ) {
    fn ( set );
  }
};

/* EXPORT */

export {lazyArrayEach, lazyArrayEachRight, lazyArrayPush};
export {lazySetAdd, lazySetDelete, lazySetEach};
