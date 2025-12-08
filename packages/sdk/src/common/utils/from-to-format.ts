import { formatBalance } from './format-balance.js';
import { isBigint } from './is-bigint.js';

export const toEthValue = (value: bigint | undefined) =>
  isBigint(value) ? `${formatBalance(value).trimmed} ETH` : '';
export const toStethValue = (value: bigint | undefined, withSymbol = true) =>
  isBigint(value)
    ? `${formatBalance(value).trimmed}${withSymbol ? ' stETH' : ''}`
    : '';
