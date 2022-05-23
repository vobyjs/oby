
/* MAIN */

class Signal {

  /* VARIABLES */

  disposed?: true;

  /* API */

  dispose (): void {

    this.disposed = true;

  }

}

/* EXPORT */

export default Signal;
