import { expect } from '@jest/globals';

export const expectHash = (hash: any) => {
  expect(typeof hash).toBe('string');
  expect(hash).toMatch(/^0x[0-9A-Fa-f]+$/);
};
