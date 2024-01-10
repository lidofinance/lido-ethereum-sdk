import type { Address } from 'viem';
import type { CommonTransactionProps } from '../../core/index.js';

export type ClaimRequestsProps = CommonTransactionProps & {
  requestsIds: readonly bigint[];
  hints?: readonly bigint[];
};

export type ClaimResultEvent = {
  requestId: bigint;
  owner: Address;
  receiver: Address;
  amountOfETH: bigint;
};

export type ClaimResult = {
  requests: ClaimResultEvent[];
};
