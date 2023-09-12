/*
We're using some Docker runtime-level env variables.
We cannot simply use `process.env` as they will be baked during Docker
build phase, so this is bypassing build optimisation via Next.
Right now these variables are only injected in client-side application.
As injection is not isomorphic, access only works via `window` by design -
this allows developer to keep in mind that only client-side has access there.
*/

import { resolve, dirname } from 'node:path';
import { ensureDirSync } from 'fs-extra';
import { writeFileSync } from 'fs';
import * as dynamics from '../env-dynamics.mjs';

export default () => {
  if (process.env.NODE_NO_BUILD_DYNAMICS) {
    return;
  }
  const path = resolve('./public/runtime/window-env.js');
  ensureDirSync(dirname(path));
  writeFileSync(path, `window.__env__=${JSON.stringify(dynamics)}`);
  console.log('created runtime files');
};
