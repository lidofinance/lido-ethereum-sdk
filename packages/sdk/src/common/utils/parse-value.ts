import { parseEther } from 'viem';
import { EtherValue } from '../../core/types.js';
import { isBigint } from './isBigint.js';

export const parseValue = (value: EtherValue): bigint => {
  if (isBigint(value)) return value;
  return parseEther(value, 'wei');
};
