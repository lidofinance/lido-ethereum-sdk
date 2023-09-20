import { type Address } from 'viem';

import { TransactionCallback } from '../../core/index.js';

export type ClaimRequestsProps = {
  account: Address;
  requestsIds: bigint[];
  hints: bigint[];
  callback?: TransactionCallback;
};

export type ClaimRequestsPropsWithoutCallback = Omit<
  ClaimRequestsProps,
  'callback'
>;
