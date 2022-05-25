
/* IMPORT */

import ObservableClass from '~/objects/observable';
import type {ObservableOptions, Observable} from '~/types';

/* MAIN */

function observable <T> (): Observable<T | undefined>;
function observable <T> ( value: undefined, options?: ObservableOptions<T | undefined> ): Observable<T | undefined>;
function observable <T> ( value: T, options?: ObservableOptions<T> ): Observable<T>;
function observable <T> ( value?: T, options?: ObservableOptions<T | undefined> ) {

  return new ObservableClass ( value, options ).writable ();

}

/* EXPORT */

export default observable;
