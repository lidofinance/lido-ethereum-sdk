import { Address } from 'viem';

export const addressEqual = (a: Address | string, b: Address | string) =>
  a.toLowerCase() === b.toLowerCase();
