import { expect, jest } from '@jest/globals';
import {
  TransactionCallback,
  TransactionCallbackStage,
} from '../../../src/core/types.js';
import { expectPositiveBn } from './expect-bn.js';
import { expectHash } from './expect-hash.js';

const mockTxCallback = jest.fn<TransactionCallback>();

export const useMockCallback = () => jest.fn<TransactionCallback>();

type ExpectTxCallbackOptions = {
  hasPermit?: boolean;
  confirmations?: bigint;
  hash?: string;
  receipt?: any;
};

export const expectTxCallback = (
  callback: typeof mockTxCallback,
  {
    hasPermit = false,
    confirmations,
    hash,
    receipt,
  }: ExpectTxCallbackOptions = {},
) => {
  expect(callback).toBeCalledTimes(hasPermit ? 6 : 5);
  let callIndex = 0;

  // PERMIT
  if (hasPermit) {
    expect(callback.mock.calls[callIndex]?.[0]).toHaveProperty(
      'stage',
      TransactionCallbackStage.PERMIT,
    );
    expect(callback.mock.calls[callIndex]?.[0].payload).toBeUndefined();
    callIndex++;
  }

  // GAS LIMIT
  expect(callback.mock.calls[callIndex]?.[0]).toHaveProperty(
    'stage',
    TransactionCallbackStage.GAS_LIMIT,
  );
  expect(callback.mock.calls[callIndex]?.[0].payload).toBeUndefined();
  callIndex++;

  // SIGN
  expect(callback.mock.calls[callIndex]?.[0]).toHaveProperty(
    'stage',
    TransactionCallbackStage.SIGN,
  );
  expectPositiveBn(callback.mock.calls[callIndex]?.[0].payload);
  callIndex++;

  // RECEIPT
  expect(callback.mock.calls[callIndex]?.[0]).toHaveProperty(
    'stage',
    TransactionCallbackStage.RECEIPT,
  );
  expectHash(callback.mock.calls[callIndex]?.[0].payload);
  hash && expect(callback.mock.calls[callIndex]?.[0].payload).toBe(hash);
  callIndex++;

  // CONFIRMATION
  expect(callback.mock.calls[callIndex]?.[0]).toHaveProperty(
    'stage',
    TransactionCallbackStage.CONFIRMATION,
  );
  expect(callback.mock.calls[callIndex]?.[0].payload).toHaveProperty(
    'blockNumber',
  );
  receipt && expect(callback.mock.calls[callIndex]?.[0].payload).toBe(receipt);
  callIndex++;

  // DONE
  expect(callback.mock.calls[callIndex]?.[0]).toHaveProperty(
    'stage',
    TransactionCallbackStage.DONE,
  );
  expectPositiveBn(callback.mock.calls[callIndex]?.[0].payload);
  confirmations &&
    expect(callback.mock.calls[callIndex]?.[0].payload).toBe(confirmations);
};
