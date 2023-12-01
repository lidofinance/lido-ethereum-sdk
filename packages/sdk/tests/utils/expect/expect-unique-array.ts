import { expect } from '@jest/globals';

export const expectUniqueArray = (arr: any) => {
  expect(Array.isArray(arr)).toBe(true);
  expect(arr).toHaveLength(new Set(arr).size);
};
