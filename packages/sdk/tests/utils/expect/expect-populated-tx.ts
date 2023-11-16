import { expect } from '@jest/globals';
import { expectAddress } from './expect-address.js';
import { expectHash } from './expect-hash.js';
import { PublicClient } from 'viem';

export const expectPopulatedTx = (
  tx: any,
  expectedValue: bigint | undefined = undefined,
  expectData: boolean | string = true,
) => {
  expect(tx).toBeDefined();
  expect(tx).toHaveProperty('to');
  expectAddress(tx.to);
  expect(tx).toHaveProperty('from');
  expectAddress(tx.from);

  // match value or lack of one
  if (expectedValue) {
    expect(tx).toHaveProperty('value');
    expect(tx.value).toBe(expectedValue);
  } else {
    expect(tx.value).toBeUndefined();
  }

  // match presence of data
  if (typeof expectData === 'boolean') {
    expectData ? expectHash(tx.data) : expect(tx.data).toBeUndefined();
  }
  // match data strictly
  if (typeof expectData === 'string') {
    expect(tx.data).toBe(expectData);
  }
};

export const expectPopulatedTxToRun = async (
  tx: any,
  publicClient: PublicClient,
) => {
  await expect(
    publicClient.estimateGas({
      ...tx,
      maxFeePerGas: undefined,
      maxPriorityFeePerGas: undefined,
      account: tx.from,
    }),
  ).resolves.toBeGreaterThan(0n);
};
