import * as dynamics from '../env-dynamics.mjs';

declare global {
  interface Window {
    __env__: typeof dynamics;
  }
}

export default typeof window !== 'undefined' ? window.__env__ : dynamics;
