
/* MAIN */

const run = async () => {

  console.time ( 'all' );

  await import ( './cellx.js' );
  await import ( './cleanup.js' );
  await import ( './context.js' );
  await import ( './creation.js' );
  await import ( './if.js' );
  await import ( './kairo.js' );
  await import ( './memory.js' );
  await import ( './read.js' );
  await import ( './store.js' );
  await import ( './store.creation.js' );
  await import ( './updates.js' );

  console.timeEnd ( 'all' );

};

run ();
