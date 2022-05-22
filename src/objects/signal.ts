
/* MAIN */

class Signal {

  /* VARIABLES */

  disposed: boolean = false;

  /* API */

  dispose (): void {

    this.disposed = true;

  }

}

/* EXPORT */

export default Signal;
