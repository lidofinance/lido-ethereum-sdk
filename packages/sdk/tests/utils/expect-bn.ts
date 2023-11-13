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

export const expectAlmostEqualBn = (
  value1: any,
  value2: any,
  maxDiff = 10n,
) => {
  const diff = value2 - value1;
  const abs = diff < 0n ? -diff : diff;
  expect(abs).toBeLessThanOrEqual(maxDiff);
};
