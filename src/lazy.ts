
/* IMPORT */

import type {LazyArray, LazySet} from '~/types';

/* MAIN */

const lazyArrayEach = <T> ( arr: LazyArray<T>, fn: ( value: T ) => false | void ): void => {
  if ( arr instanceof Array ) {
    for ( let i = 0, l = arr.length; i < l; i++ ) {
      if ( fn ( arr[i] ) === false ) break;
    }
  } else if ( arr ) {
    fn ( arr );
  }
};

const lazyArrayEachRight = <T> ( arr: LazyArray<T>, fn: ( value: T ) => false | void ): void => {
  if ( arr instanceof Array ) {
    for ( let i = arr.length - 1; i >= 0; i-- ) {
      if ( fn ( arr[i] ) === false ) break;
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

const lazySetEach = <T> ( set: LazySet<T>, fn: ( value: T ) => false | void ): void => {
  if ( set instanceof Set ) {
    for ( const value of set ) {
      if ( fn ( value ) === false ) break;
    }
  } else if ( set ) {
    fn ( set );
  }
};

const lazySetHas = <T> ( set: LazySet<T>, value: T ): boolean => {
  if ( set instanceof Set ) {
    return set.has ( value );
  } else {
    return set === value;
  }
};

/* EXPORT */

export {lazyArrayEach, lazyArrayEachRight, lazyArrayPush};
export {lazySetAdd, lazySetDelete, lazySetEach, lazySetHas};

//TODO: REVIEW
