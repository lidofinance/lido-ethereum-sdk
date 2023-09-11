import { type Address } from 'viem';

export type ClaimRequestsProps = {
  account: Address;
  requestsIds: bigint[];
  hints: bigint[];
};
