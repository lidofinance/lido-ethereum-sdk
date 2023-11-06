import { expect } from '@jest/globals';

export const expectContract = (contract: any) => {
  expect(contract).toBeDefined();
  expect(contract).toHaveProperty('address');
  expect(contract).toHaveProperty('read');
};
