import { isAddress, zeroAddress, type Address } from 'viem';
import { invariantArgument } from '../common/utils/sdk-error.js';
import type { EarnCollectorConfig } from './types.js';

export const EARN_COLLECTOR_CONFIG: Readonly<EarnCollectorConfig> =
  Object.freeze({
    baseAssetFallback: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    oracleUpdateInterval: 86400n,
    redeemHandlingInterval: 3600n,
  });

export const EARN_USD_DECIMALS = 8;

export const assertEarnAmount = (
  value: bigint,
  bits = 256,
  allowZero = false,
) => {
  invariantArgument(
    typeof value === 'bigint' &&
      value >= (allowZero ? 0n : 1n) &&
      value < 1n << BigInt(bits),
    `Amount must fit uint${bits}${allowZero ? '' : ' and be positive'}`,
  );
};

export const assertEarnAddress = (address: Address, allowZero = false) => {
  invariantArgument(
    isAddress(address, { strict: false }) &&
      (allowZero || address.toLowerCase() !== zeroAddress),
    'Invalid Earn address',
  );
};
