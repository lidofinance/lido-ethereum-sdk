import { expect } from '@jest/globals';
import { isAddress } from 'viem';

export const expectAddress = (address: any) => {
  expect(isAddress(address));
};
