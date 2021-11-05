
/* MAIN */

class Callable extends Function {

  /* CONSTRUCTOR */

  constructor () {

    super ( 'return this.__bound__.__call__.apply ( this.__bound__, arguments )' );

    return this['__bound__'] = this.bind ( this );

  }

}

/* EXPORT */

export default Callable;
