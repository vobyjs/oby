
/* IMPORT */

import fs from 'node:fs';
import path from 'node:path';

/* MAIN */

const optimizeCurrentProperty = () => {

  const indexPath = path.join ( process.cwd (), 'dist', 'index.js' );
  const indexContent = fs.readFileSync ( indexPath, 'utf8' );

  let indexContentNext = indexContent;

  indexContentNext = indexContentNext.replace ( /\.current/g, '' );
  indexContentNext = indexContentNext.replace ( /{current:([^}]+)}/g, '$1' );

  fs.writeFileSync ( indexPath, indexContentNext );

};

const optimize = () => {

  optimizeCurrentProperty ();

};

optimize ();
