import { Address } from 'viem';

/**
 * @deprecated use native viem isAddressEqual
 */
export const addressEqual = (a: Address | string, b: Address | string) =>
  a.toLowerCase() === b.toLowerCase();
