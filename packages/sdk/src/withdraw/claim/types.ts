import { type Address } from 'viem';
import { type TransactionCallback } from '../../core/index.js';

export type ClaimRequestsProps = {
  account: Address;
  requestsIds: bigint[];
  hints?: bigint[];
  callback?: TransactionCallback;
};
