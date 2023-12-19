import { expect } from '@jest/globals';
import { expectAddress } from './expect-address.js';

export const expectContract = (contract: any, address?: string) => {
  expect(contract).toBeDefined();
  expect(contract).toHaveProperty('address');
  expect(contract).toHaveProperty('read');
  address && expectAddress(contract.address, address);
};
