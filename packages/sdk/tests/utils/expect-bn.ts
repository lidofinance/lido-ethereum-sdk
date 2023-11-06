import { expect } from '@jest/globals';

export const expectBn = (value: any) => {
  expect(typeof value === 'bigint');
};

export const expectPositiveBn = (value: any) => {
  expectBn(value);
  expect(value > 0n);
};

export const expectNonNegativeBn = (value: any) => {
  expectBn(value);
  expect(value >= 0n);
};
