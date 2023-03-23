
/* MAIN */

// BITS: [...00000][0][00]
// MEANING: [...COUNT][FRESH][EXECUTION]
// - EXECUTION: 0: SLEEPING, 1: EXECUTING, 2: PENDING_NO_FRESH, 3: PENDING_FRESH
// - FRESH: Whether some observables got actually updated
// - COUNT: The count is incremented on stale messages and decremented on unstale messages

const getExecution = ( status: number ): 0 | 1 | 2 | 3 => {

  return ( status & 0b00000011 ) as 0 | 1 | 2 | 3; //TSC

};

const setExecution = ( status: number, execution: 0 | 1 | 2 | 3 ): number => {

  return ( ( status >>> 2 ) << 2 ) | execution;

};

const getFresh = ( status: number ): boolean => {

  return !!( status & 0b00000100 );

};

const setFresh = ( status: number, fresh: boolean ): number => {

  return ( fresh ? status | 0b00000100 : status );

};

const getCount = ( status: number ): number => {

  return status >>> 3;

};

const changeCount = ( status: number, change: number ): number => {

  return status + ( change << 3 );

};

/* EXPORT */

export {getExecution, setExecution, getFresh, setFresh, getCount, changeCount};
