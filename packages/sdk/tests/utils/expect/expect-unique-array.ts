import { expect } from 'vitest';

export const expectUniqueArray = (arr: any) => {
  expect(Array.isArray(arr)).toBe(true);
  expect(arr).toHaveLength(new Set(arr).size);
};
