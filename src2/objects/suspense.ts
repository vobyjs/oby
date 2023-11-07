
/* MAIN */

const suspenseIs = ( owner: OwnerState ): boolean => {

  return ( owner.flags & MASK_OWNER_TYPE ) === FLAG_OWNER_TYPE_SUSPENSE;

};

/* EXPORT */

export {suspenseIs};
