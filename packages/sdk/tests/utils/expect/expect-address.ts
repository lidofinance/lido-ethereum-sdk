import { expect } from 'vitest';
import { isAddress } from 'viem';

export const expectAddress = (address: any, expected?: string) => {
  expect(isAddress(address));
  expected && expect(address.toLowerCase()).toMatch(expected.toLowerCase());
};
