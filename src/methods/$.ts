
/* IMPORT */

import batch from '~/methods/batch';
import cleanup from '~/methods/cleanup';
import computed from '~/methods/computed';
import context from '~/methods/context';
import disposed from '~/methods/disposed';
import effect from '~/methods/effect';
import error from '~/methods/error';
import _for from '~/methods/for';
import get from '~/methods/get';
import _if from '~/methods/if';
import is from '~/methods/is';
import readonly from '~/methods/readonly';
import resolve from '~/methods/resolve';
import root from '~/methods/root';
import sample from '~/methods/sample';
import selector from '~/methods/selector';
import suspense from '~/methods/suspense';
import _switch from '~/methods/switch';
import ternary from '~/methods/ternary';
import tryCatch from '~/methods/try_catch';
import {writable} from '~/objects/callable';
import ObservableClass from '~/objects/observable';
import type {ObservableOptions, Observable} from '~/types';

/* MAIN */

function $ <T> (): Observable<T | undefined>;
function $ <T> ( value: undefined, options?: ObservableOptions<T | undefined> ): Observable<T | undefined>;
function $ <T> ( value: T, options?: ObservableOptions<T> ): Observable<T>;
function $ <T> ( value?: T, options?: ObservableOptions<T | undefined> ) {

  return writable ( new ObservableClass ( value, options ) );

}

/* UTILITIES */

$.batch = batch;
$.cleanup = cleanup;
$.computed = computed;
$.context  = context;
$.disposed = disposed;
$.effect = effect;
$.error = error;
$.for = _for;
$.get = get;
$.if = _if;
$.is = is;
$.readonly = readonly;
$.resolve = resolve;
$.root = root;
$.sample = sample;
$.selector = selector;
$.suspense = suspense;
$.switch = _switch;
$.ternary = ternary;
$.tryCatch = tryCatch;

/* EXPORT */

export default $;
