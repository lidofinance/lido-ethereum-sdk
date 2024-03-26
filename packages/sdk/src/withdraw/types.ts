import type { Address } from 'viem';
import type { Bus } from './bus.js';
import type { AccountValue } from '../index.js';
import { CHAINS } from '../index.js';

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
  account?: AccountValue;
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

export type WqApiCustomUrlGetter = (
  defaultUrl: string | null,
  chainId: CHAINS,
) => string;

export type WithdrawalWaitingTimeByAmountParams = {
  amount?: bigint;
  getCustomApiUrl?: WqApiCustomUrlGetter;
};

export type RequestInfo = {
  finalizationIn: number;
  finalizationAt: string;
  type: WaitingTimeCalculationType;
};

export type WithdrawalWaitingTimeByAmountResponse = {
  requestInfo: RequestInfo;
  status: WaitingTimeStatus;
  nextCalculationAt: string;
};

export type WithdrawalWaitingTimeByRequestIdsParams = {
  ids: readonly bigint[];
  requestDelay?: number;
  getCustomApiUrl?: WqApiCustomUrlGetter;
};

export type RequestByIdInfo = {
  finalizationIn: number;
  finalizationAt: string;
  requestId?: string;
  requestedAt?: string;
  type: WaitingTimeCalculationType;
};

export type WithdrawalWaitingTimeRequestInfo = {
  requestInfo: RequestByIdInfo;
  status: WaitingTimeStatus;
  nextCalculationAt: string;
};

export enum WaitingTimeStatus {
  initializing = 'initializing',
  calculating = 'calculating',
  finalized = 'finalized',
  calculated = 'calculated',
}

export enum WaitingTimeCalculationType {
  buffer = 'buffer',
  bunker = 'bunker',
  vaultsBalance = 'vaultsBalance',
  rewardsOnly = 'rewardsOnly',
  validatorBalances = 'validatorBalances',
  requestTimestampMargin = 'requestTimestampMargin',
  exitValidators = 'exitValidators',
}
