import type { Address, JsonRpcAccount } from 'viem';
import { CommonTransactionProps } from '../core/types.js';
import { EtherValue } from '../core/types.js';

export type StakeProps = CommonTransactionProps & {
  value: EtherValue;
  referralAddress?: Address;
};

export type StakeInnerProps = Omit<CommonTransactionProps, 'account'> & {
  value: bigint;
  referralAddress: Address;
  account: JsonRpcAccount;
};

export type StakeResult = {
  stethReceived: bigint;
  sharesReceived: bigint;
};

export type StakeEncodeDataProps = {
  referralAddress?: Address;
};

export type StakeLimitResult = {
  isStakingPaused: boolean;
  isStakingLimitSet: boolean;
  currentStakeLimit: bigint;
  maxStakeLimit: bigint;
  maxStakeLimitGrowthBlocks: bigint;
  prevStakeLimit: bigint;
  prevStakeBlockNumber: bigint;
};
