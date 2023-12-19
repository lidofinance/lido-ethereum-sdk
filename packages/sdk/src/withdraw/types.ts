import type { Address } from 'viem';
import type { Bus } from './bus.js';
import type { AccountValue } from '../index.js';

export type LidoSDKWithdrawModuleProps = { bus: Bus; version?: string };

export type RequestStatus = {
  amountOfStETH: bigint;
  amountOfShares: bigint;
  owner: Address;
  timestamp: bigint;
  isFinalized: boolean;
  isClaimed: boolean;
};

export type RequestStatusWithId = {
  amountOfStETH: bigint;
  amountOfShares: bigint;
  owner: Address;
  timestamp: bigint;
  isFinalized: boolean;
  isClaimed: boolean;
  id: bigint;
  stringId: string;
};

export type PropsWithAccount = {
  account: AccountValue;
};

export type GetPendingRequestsInfoReturnType = {
  pendingRequests: RequestStatusWithId[];
  pendingAmountStETH: bigint;
};

export type GetClaimableRequestsInfoReturnType = {
  claimableRequests: RequestStatusWithId[];
  claimableAmountStETH: bigint;
};

export type GetClaimableRequestsETHByAccountReturnType = {
  ethByRequests: readonly bigint[];
  ethSum: bigint;
  hints: readonly bigint[];
  requests: readonly RequestStatusWithId[];
  sortedIds: readonly bigint[];
};

export type GetWithdrawalRequestsInfoReturnType = {
  claimableInfo: GetClaimableRequestsInfoReturnType;
  pendingInfo: GetPendingRequestsInfoReturnType;
  claimableETH: GetClaimableRequestsETHByAccountReturnType;
};
